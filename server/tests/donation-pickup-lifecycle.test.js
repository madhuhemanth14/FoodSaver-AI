// Integration tests for Ticket 2: Test the Donation and Pickup Lifecycle
// Covers:
//   1. Donation creation and automated expiration sweeps (expireOverdueDonations / expireIfOverdue)
//   2. NGO acceptance workflow (PATCH /api/donations/:id/accept)
//   3. Role-based access control (NGO vs Donor permissions on acceptance and scheduling)
//   4. Conflict handling (duplicate acceptance by another NGO and expired food rejections)
//   5. Pickup scheduling by authorized NGO (POST /api/pickups)
//   6. Pickup confirmation by donor only (PUT /api/pickups/:id -> Confirmed)
//   7. Pickup fulfillment transitions (Confirmed -> Picked Up -> Completed)
//   8. Invalid status transition rejection (e.g. skips, backward, terminal changes)
//   9. Cross-tenant access boundaries (NGO A cannot touch NGO B's pickup; Donor B cannot confirm Donor A's pickup)

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-ticket-2-lifecycle";
process.env.EMAIL_USER = "noreply@foodsaver.test";
process.env.EMAIL_PASS = "dummy_password";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { EventEmitter } = require("events");

// ---- Stub nodemailer ----
const nodemailer = require("nodemailer");
const outbox = [];
nodemailer.createTransport = () => ({
  async sendMail(opts) {
    outbox.push(opts);
    return { accepted: [opts.to], rejected: [], messageId: "stub-id" };
  },
});

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const NGO = require("../models/NGO");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const { expireOverdueDonations, expireIfOverdue } = require("../services/donationExpiry");

const donationRoutes = require("../routes/donationRoutes");
const pickupRoutes = require("../routes/pickupRoutes");

let app;

// In-memory data store
const mockUsers = new Map();
const mockNGOs = new Map();
const mockDonations = new Map();
const mockPickups = new Map();

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === "$or" && Array.isArray(val)) {
      const anyMatch = val.some((sub) => matchesFilter(item, sub));
      if (!anyMatch) return false;
      continue;
    }
    if (key === "$and" && Array.isArray(val)) {
      const allMatch = val.every((sub) => matchesFilter(item, sub));
      if (!allMatch) return false;
      continue;
    }

    const itemVal = item[key];
    if (val === null) {
      if (itemVal !== null && itemVal !== undefined) return false;
    } else if (val instanceof Date) {
      if (!itemVal || new Date(itemVal).getTime() !== val.getTime()) return false;
    } else if (
      val &&
      typeof val === "object" &&
      !(val instanceof mongoose.Types.ObjectId) &&
      (val.$ne !== undefined || val.$in !== undefined || val.$lte !== undefined || val.$gt !== undefined)
    ) {
      if (val.$ne !== undefined) {
        if (String(itemVal) === String(val.$ne)) return false;
      }
      if (val.$in !== undefined) {
        if (!val.$in.map(String).includes(String(itemVal))) return false;
      }
      if (val.$lte !== undefined) {
        if (!itemVal || new Date(itemVal) > new Date(val.$lte)) return false;
      }
      if (val.$gt !== undefined) {
        if (!itemVal || new Date(itemVal) <= new Date(val.$gt)) return false;
      }
    } else {
      if (String(itemVal) !== String(val)) {
        return false;
      }
    }
  }
  return true;
}

// User model stubs
User.findById = (id) => {
  const u = mockUsers.get(String(id));
  return {
    select: async () => u || null,
  };
};

User.findOne = async (query) => {
  for (const u of mockUsers.values()) {
    if (matchesFilter(u, query)) return u;
  }
  return null;
};

// NGO model stubs
NGO.findOne = (query) => {
  let found = null;
  for (const ngo of mockNGOs.values()) {
    if (matchesFilter(ngo, query)) {
      found = ngo;
      break;
    }
  }
  return {
    select: (fields) => {
      if (!found) return Promise.resolve(null);
      return Promise.resolve({ ...found });
    },
    then: (resolve, reject) => Promise.resolve(found).then(resolve, reject),
  };
};

NGO.findById = (id) => {
  const found = mockNGOs.get(String(id)) || null;
  return {
    select: (fields) => Promise.resolve(found ? { ...found } : null),
    then: (resolve, reject) => Promise.resolve(found).then(resolve, reject),
  };
};

// Donation model stubs
function wrapDonation(doc) {
  if (!doc) return null;
  const wrapped = {
    ...doc,
    async save() {
      mockDonations.set(String(this._id), { ...this });
      return this;
    },
  };
  return wrapped;
}

Donation.findById = async (id) => {
  const d = mockDonations.get(String(id));
  return wrapDonation(d);
};

Donation.findOne = async (query) => {
  for (const d of mockDonations.values()) {
    if (matchesFilter(d, query)) return wrapDonation(d);
  }
  return null;
};

Donation.create = async (data) => {
  const _id = new mongoose.Types.ObjectId();
  const doc = {
    _id,
    status: "Available",
    pickup: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  mockDonations.set(String(_id), doc);
  return wrapDonation(doc);
};

Donation.findOneAndUpdate = async (filter, update, options = {}) => {
  for (const d of mockDonations.values()) {
    if (matchesFilter(d, filter)) {
      const up = update.$set || update;
      const updated = { ...d, ...up, updatedAt: new Date() };
      mockDonations.set(String(d._id), updated);
      return wrapDonation(updated);
    }
  }
  return null;
};

Donation.findByIdAndUpdate = async (id, update, options = {}) => {
  const d = mockDonations.get(String(id));
  if (!d) return null;
  const up = update.$set || update;
  const updated = { ...d, ...up, updatedAt: new Date() };
  mockDonations.set(String(id), updated);
  return wrapDonation(updated);
};

Donation.updateOne = async (filter, update) => {
  for (const d of mockDonations.values()) {
    if (matchesFilter(d, filter)) {
      const up = update.$set || update;
      mockDonations.set(String(d._id), { ...d, ...up, updatedAt: new Date() });
      return { modifiedCount: 1 };
    }
  }
  return { modifiedCount: 0 };
};

Donation.updateMany = async (filter, update) => {
  let count = 0;
  for (const d of mockDonations.values()) {
    if (matchesFilter(d, filter)) {
      const up = update.$set || update;
      mockDonations.set(String(d._id), { ...d, ...up, updatedAt: new Date() });
      count++;
    }
  }
  return { modifiedCount: count };
};

Donation.find = (filter) => ({
  sort: () => Promise.resolve(Array.from(mockDonations.values()).filter((d) => matchesFilter(d, filter))),
});

// Pickup model stubs
function wrapPickup(doc) {
  if (!doc) return null;
  const wrapped = {
    ...doc,
    pickupDate: doc.pickupDate instanceof Date ? doc.pickupDate : new Date(doc.pickupDate || Date.now()),
    populate: function (field, selectFields) {
      if (field === "ngo" && this.ngo) {
        const ngoDoc = mockNGOs.get(String(this.ngo._id || this.ngo));
        this.ngo = ngoDoc || this.ngo;
      }
      return Promise.resolve(this);
    },
    async save() {
      mockPickups.set(String(this._id), { ...this });
      return this;
    },
  };
  return wrapped;
}

Pickup.create = async (data) => {
  const _id = new mongoose.Types.ObjectId();
  const doc = {
    _id,
    status: "Pending Confirmation",
    pickupDate: data.pickupDate ? new Date(data.pickupDate) : new Date(),
    pickupTime: data.pickupTime || "12:00",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  mockPickups.set(String(_id), doc);
  return wrapPickup(doc);
};

Pickup.findById = (id) => {
  const p = mockPickups.get(String(id));
  const wrapped = wrapPickup(p);
  return {
    populate: (field, selectFields) => {
      if (!wrapped) return Promise.resolve(null);
      return wrapped.populate(field, selectFields);
    },
    then: (resolve, reject) => Promise.resolve(wrapped).then(resolve, reject),
  };
};

Pickup.findOneAndUpdate = (filter, update, options = {}) => {
  let found = null;
  for (const p of mockPickups.values()) {
    if (matchesFilter(p, filter)) {
      const up = update.$set || update;
      const updated = { ...p, ...up, updatedAt: new Date() };
      mockPickups.set(String(p._id), updated);
      found = wrapPickup(updated);
      break;
    }
  }
  return {
    populate: (field, selectFields) => {
      if (!found) return Promise.resolve(null);
      return found.populate(field, selectFields);
    },
    then: (resolve, reject) => Promise.resolve(found).then(resolve, reject),
  };
};

Pickup.exists = async (query) => {
  for (const p of mockPickups.values()) {
    if (matchesFilter(p, query)) return { _id: p._id };
  }
  return null;
};

Notification.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
Activity.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

function makeRequest(path, { method = "GET", token, body, ip = "127.0.0.1" } = {}) {
  return new Promise((resolve) => {
    const socket = new EventEmitter();
    socket.destroy = () => {};
    socket.remoteAddress = ip;

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = path;
    req.ip = ip;
    req.connection = socket;
    req.headers = {
      "content-type": "application/json",
      host: "localhost",
    };
    if (token) {
      req.headers["authorization"] = `Bearer ${token}`;
    }
    req.body = body || {};
    req._body = true;

    const res = new http.ServerResponse(req);
    let responseBody = "";
    res.write = function (chunk) {
      if (chunk) responseBody += chunk;
      return true;
    };
    res.end = function (chunk) {
      if (chunk) responseBody += chunk;
      let json = {};
      try {
        json = JSON.parse(responseBody);
      } catch {}

      resolve({
        status: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        body: json,
      });
    };

    app(req, res);
  });
}

// User fixtures
let donorA, donorB, ngoUserA, ngoUserB, adminUser;
let donorAToken, donorBToken, ngoUserAToken, ngoUserBToken, adminToken;
let ngoRecordA, ngoRecordB;

test.before(() => {
  // Donor A
  const donorAId = new mongoose.Types.ObjectId();
  donorA = {
    _id: donorAId,
    name: "Donor Alice",
    email: "alice@foodsaver.test",
    role: "donor",
    isEmailVerified: true,
    isBlocked: false,
    phone: "9876543210",
    address: "101 Green Street",
  };
  mockUsers.set(String(donorAId), donorA);
  donorAToken = jwt.sign({ id: donorA._id, role: "donor" }, process.env.JWT_SECRET);

  // Donor B (for unauthorized test)
  const donorBId = new mongoose.Types.ObjectId();
  donorB = {
    _id: donorBId,
    name: "Donor Bob",
    email: "bob@foodsaver.test",
    role: "donor",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(donorBId), donorB);
  donorBToken = jwt.sign({ id: donorB._id, role: "donor" }, process.env.JWT_SECRET);

  // NGO User A
  const ngoUserAId = new mongoose.Types.ObjectId();
  ngoUserA = {
    _id: ngoUserAId,
    name: "Helping Hands NGO Rep",
    email: "rep@helpinghands.test",
    role: "ngo",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(ngoUserAId), ngoUserA);
  ngoUserAToken = jwt.sign({ id: ngoUserA._id, role: "ngo" }, process.env.JWT_SECRET);

  const ngoRecordAId = new mongoose.Types.ObjectId();
  ngoRecordA = {
    _id: ngoRecordAId,
    user: ngoUserAId,
    name: "Helping Hands Foundation",
    shortName: "Helping Hands",
    email: "contact@helpinghands.test",
    phone: "9876543222",
    address: "202 Care Avenue",
    equals: (other) => String(other) === String(ngoRecordAId),
  };
  mockNGOs.set(String(ngoRecordAId), ngoRecordA);

  // NGO User B (Competitor NGO)
  const ngoUserBId = new mongoose.Types.ObjectId();
  ngoUserB = {
    _id: ngoUserBId,
    name: "Food Bank Rep",
    email: "rep@foodbank.test",
    role: "ngo",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(ngoUserBId), ngoUserB);
  ngoUserBToken = jwt.sign({ id: ngoUserB._id, role: "ngo" }, process.env.JWT_SECRET);

  const ngoRecordBId = new mongoose.Types.ObjectId();
  ngoRecordB = {
    _id: ngoRecordBId,
    user: ngoUserBId,
    name: "City Food Bank",
    shortName: "Food Bank",
    email: "contact@foodbank.test",
    phone: "9876543333",
    address: "303 Hope Boulevard",
    equals: (other) => String(other) === String(ngoRecordBId),
  };
  mockNGOs.set(String(ngoRecordBId), ngoRecordB);

  // Admin User
  const adminId = new mongoose.Types.ObjectId();
  adminUser = {
    _id: adminId,
    name: "Admin Super",
    email: "admin@foodsaver.test",
    role: "admin",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(adminId), adminUser);
  adminToken = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET);

  app = express();
  app.use(express.json());
  app.use("/api/donations", donationRoutes);
  app.use("/api/pickups", pickupRoutes);
});

// ============================================================================
// 1. DONATION EXPIRATION SWEEPS (expireOverdueDonations & expireIfOverdue)
// ============================================================================

test("Donation Expiry: expireOverdueDonations transitions past-due donations to 'Expired'", async () => {
  const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Sandwiches"],
    quantity: 10,
    status: "Available",
    expiryDate: pastDate,
  });

  const res = await expireOverdueDonations(new Date());
  assert.ok(res.modifiedCount >= 1);

  const updated = await Donation.findById(donation._id);
  assert.equal(updated.status, "Expired");
});

test("Donation Expiry: expireIfOverdue marks a single expired document as 'Expired'", async () => {
  const pastDate = new Date(Date.now() - 7200000);
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Cooked Rice"],
    quantity: 5,
    status: "Available",
    expiryDate: pastDate,
  });

  const isExpired = await expireIfOverdue(donation, new Date());
  assert.equal(isExpired, true);
  assert.equal(donation.status, "Expired");
});

// ============================================================================
// 2. NGO DONATION ACCEPTANCE & ROLE PERMISSIONS (PATCH /api/donations/:id/accept)
// ============================================================================

test("PATCH /api/donations/:id/accept: rejects unauthenticated requests with 401", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await makeRequest(`/api/donations/${fakeId}/accept`, { method: "PATCH" });
  assert.equal(res.status, 401);
});

test("PATCH /api/donations/:id/accept: rejects donor role with 403 Forbidden", async () => {
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Fresh Apples"],
    quantity: 15,
    status: "Available",
  });

  const res = await makeRequest(`/api/donations/${donation._id}/accept`, {
    method: "PATCH",
    token: donorAToken,
  });
  assert.equal(res.status, 403);
});

test("PATCH /api/donations/:id/accept: allows authorized NGO to claim Available donation", async () => {
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Fresh Vegetables"],
    quantity: 20,
    status: "Available",
    expiryDate: new Date(Date.now() + 86400000), // 24 hours future
  });

  const res = await makeRequest(`/api/donations/${donation._id}/accept`, {
    method: "PATCH",
    token: ngoUserAToken,
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, "Accepted");
  assert.equal(String(res.body.data.ngo), String(ngoRecordA._id));
});

test("PATCH /api/donations/:id/accept: refuses expired donation with 409 Conflict", async () => {
  const expiredDonation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Bakery Pastries"],
    quantity: 8,
    status: "Available",
    expiryDate: new Date(Date.now() - 10000), // Expired 10s ago
  });

  const res = await makeRequest(`/api/donations/${expiredDonation._id}/accept`, {
    method: "PATCH",
    token: ngoUserAToken,
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes("expired"));
});

test("PATCH /api/donations/:id/accept: prevents duplicate claim by second NGO with 409 Conflict", async () => {
  // First, NGO A accepts
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Canned Soup"],
    quantity: 12,
    status: "Available",
    expiryDate: new Date(Date.now() + 86400000),
  });

  const firstClaim = await makeRequest(`/api/donations/${donation._id}/accept`, {
    method: "PATCH",
    token: ngoUserAToken,
  });
  assert.equal(firstClaim.status, 200);

  // Second, NGO B tries to claim the same donation
  const secondClaim = await makeRequest(`/api/donations/${donation._id}/accept`, {
    method: "PATCH",
    token: ngoUserBToken,
  });
  assert.equal(secondClaim.status, 409);
  assert.equal(secondClaim.body.success, false);
  assert.ok(secondClaim.body.message.includes("no longer available"));
});

// ============================================================================
// 3. PICKUP SCHEDULING (POST /api/pickups)
// ============================================================================

test("POST /api/pickups: rejects non-NGO role with 403", async () => {
  const res = await makeRequest("/api/pickups", {
    method: "POST",
    token: donorAToken,
    body: { donationId: new mongoose.Types.ObjectId() },
  });
  assert.equal(res.status, 403);
  assert.ok(res.body.message.includes("Pickups are scheduled by the NGO"));
});

test("POST /api/pickups: rejects scheduling for donation accepted by another NGO with 403", async () => {
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Rice and Dal"],
    quantity: 10,
    status: "Accepted",
    ngo: ngoRecordA._id,
    expiryDate: new Date(Date.now() + 86400000),
    address: "101 Green Street",
  });

  // NGO B attempts to schedule pickup for NGO A's accepted donation
  const res = await makeRequest("/api/pickups", {
    method: "POST",
    token: ngoUserBToken,
    body: {
      donationId: donation._id.toString(),
      pickupAt: new Date(Date.now() + 7200000).toISOString(),
      address: "101 Green Street",
    },
  });

  assert.equal(res.status, 403);
  assert.ok(res.body.message.includes("accepted by a different NGO"));
});

test("POST /api/pickups: successfully schedules pickup and transitions donation to 'Closed'", async () => {
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Fresh Mangoes"],
    quantity: 25,
    quantityUnit: "kg",
    status: "Accepted",
    ngo: ngoRecordA._id,
    expiryDate: new Date(Date.now() + 86400000),
    address: "101 Green Street",
  });

  const futurePickup = new Date(Date.now() + 7200000); // 2 hours future
  const res = await makeRequest("/api/pickups", {
    method: "POST",
    token: ngoUserAToken,
    body: {
      donationId: donation._id.toString(),
      pickupAt: futurePickup.toISOString(),
      address: "101 Green Street",
      notes: "Arriving in a refrigerated van.",
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, "Pending Confirmation");
  assert.equal(res.body.data.donorName, donorA.name);

  // Verify donation transitioned to 'Closed'
  const closedDonation = await Donation.findById(donation._id);
  assert.equal(closedDonation.status, "Closed");
});

// ============================================================================
// 4. PICKUP CONFIRMATION & LIFECYCLE TRANSITIONS (PUT /api/pickups/:id)
// ============================================================================

test("PUT /api/pickups/:id: NGO cannot self-confirm; only donor can confirm scheduled pickup", async () => {
  const pickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Apples"],
    quantity: 10,
    address: "101 Green Street",
    status: "Pending Confirmation",
  });

  // NGO tries to confirm -> 403
  const ngoConfirm = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Confirmed" },
  });
  assert.equal(ngoConfirm.status, 403);
  assert.ok(ngoConfirm.body.message.includes("Only the donor can confirm"));

  // Unauthorized donor B tries to confirm -> 403
  const badDonorConfirm = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: donorBToken,
    body: { status: "Confirmed" },
  });
  assert.equal(badDonorConfirm.status, 403);
  assert.ok(badDonorConfirm.body.message.includes("do not have access"));

  // Authorized donor A confirms -> 200
  const donorConfirm = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: donorAToken,
    body: { status: "Confirmed" },
  });
  assert.equal(donorConfirm.status, 200);
  assert.equal(donorConfirm.body.success, true);
  assert.equal(donorConfirm.body.data.status, "Confirmed");
});

test("PUT /api/pickups/:id: donor cannot mark 'Picked Up' or 'Completed'", async () => {
  const pickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Rice"],
    quantity: 20,
    address: "101 Green Street",
    status: "Confirmed",
  });

  const res = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: donorAToken,
    body: { status: "Picked Up" },
  });

  assert.equal(res.status, 403);
  assert.ok(res.body.message.includes("Donors can only confirm a pickup"));
});

test("PUT /api/pickups/:id: complete lifecycle transition (Confirmed -> Picked Up -> Completed)", async () => {
  const donation = await Donation.create({
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    foodItems: ["Cooked Meals"],
    quantity: 30,
    status: "Closed",
    ngo: ngoRecordA._id,
  });

  const pickup = await Pickup.create({
    donation: donation._id,
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Cooked Meals"],
    quantity: 30,
    address: "101 Green Street",
    status: "Confirmed",
  });

  // Step 1: NGO marks 'Picked Up'
  const pickedUpRes = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Picked Up" },
  });
  assert.equal(pickedUpRes.status, 200);
  assert.equal(pickedUpRes.body.data.status, "Picked Up");

  // Verify donation status synced to 'Picked Up'
  const donationAfterPickup = await Donation.findById(donation._id);
  assert.equal(donationAfterPickup.status, "Picked Up");

  // Step 2: NGO marks 'Completed'
  const completedRes = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Completed" },
  });
  assert.equal(completedRes.status, 200);
  assert.equal(completedRes.body.data.status, "Completed");

  // Verify donation status synced to 'Completed'
  const donationAfterCompleted = await Donation.findById(donation._id);
  assert.equal(donationAfterCompleted.status, "Completed");
});

// ============================================================================
// 5. INVALID STATUS TRANSITIONS & GUARDRAILS
// ============================================================================

test("PUT /api/pickups/:id: rejects skipping 'Confirmed' directly to 'Picked Up' or 'Completed'", async () => {
  const pickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Breads"],
    quantity: 10,
    address: "101 Green Street",
    status: "Pending Confirmation",
  });

  // Attempt skip: Pending Confirmation -> Picked Up
  const skipToPickedUp = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Picked Up" },
  });
  assert.equal(skipToPickedUp.status, 400);
  assert.ok(skipToPickedUp.body.message.includes("must confirm the pickup before"));

  // Attempt skip: Pending Confirmation -> Completed
  const skipToCompleted = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Completed" },
  });
  assert.equal(skipToCompleted.status, 400);
  assert.ok(skipToCompleted.body.message.includes("must confirm and the food must be picked up"));
});

test("PUT /api/pickups/:id: terminal states 'Completed' and 'Cancelled' are immutable", async () => {
  const completedPickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Milk"],
    quantity: 5,
    address: "101 Green Street",
    status: "Completed",
  });

  // Donor tries to reopen completed pickup to Confirmed -> 400
  const changeCompleted = await makeRequest(`/api/pickups/${completedPickup._id}`, {
    method: "PUT",
    token: donorAToken,
    body: { status: "Confirmed" },
  });
  assert.equal(changeCompleted.status, 400);
  assert.ok(changeCompleted.body.message.includes("completed pickup cannot be changed"));

  const cancelledPickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Milk"],
    quantity: 5,
    address: "101 Green Street",
    status: "Cancelled",
  });

  // NGO tries to complete cancelled pickup -> 400
  const changeCancelled = await makeRequest(`/api/pickups/${cancelledPickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "Completed" },
  });
  assert.equal(changeCancelled.status, 400);
  assert.ok(changeCancelled.body.message.includes("cancelled pickup cannot be changed"));
});

test("PUT /api/pickups/:id: rejects invalid status strings with 400", async () => {
  const pickup = await Pickup.create({
    donation: new mongoose.Types.ObjectId(),
    ngo: ngoRecordA._id,
    donor: donorA._id,
    donorName: donorA.name,
    donorEmail: donorA.email,
    donorPhone: "9876543210",
    foodItems: ["Fruit Salad"],
    quantity: 4,
    address: "101 Green Street",
    status: "Confirmed",
  });

  const res = await makeRequest(`/api/pickups/${pickup._id}`, {
    method: "PUT",
    token: ngoUserAToken,
    body: { status: "ArbitraryNonExistentStatus" },
  });
  assert.equal(res.status, 400);
  assert.ok(res.body.message.includes("Invalid status"));
});
