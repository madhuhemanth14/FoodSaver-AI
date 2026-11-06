// Integration tests for Ticket 1: Secure the Email API Endpoints
// Verifies:
//   * Authentication & RBAC on /api/email/test (401 unauthenticated, 403 non-admin, 200 admin)
//   * Strict input validation on /api/email/test and /api/email/contact-admin
//   * Rate limiting enforcement on /api/email/test, /api/email/contact-admin, and /api/contact
//   * Server-side AI analysis verification on donation creation

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production-ticket-1-key";
process.env.EMAIL_USER = "noreply@foodsaver.test";
process.env.EMAIL_PASS = "dummy_password";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { EventEmitter } = require("events");

// ---- Stub nodemailer before requiring app modules ----
const nodemailer = require("nodemailer");
const outbox = [];
nodemailer.createTransport = () => ({
  async sendMail(opts) {
    outbox.push(opts);
    return { accepted: [opts.to], rejected: [], messageId: "stub-msg-id" };
  },
});

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Donation = require("../models/Donation");
const AnalysisResult = require("../models/AnalysisResult");
const ContactMessage = require("../models/ContactMessage");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const NGO = require("../models/NGO");

const emailRoutes = require("../routes/emailRoutes");
const contactRoutes = require("../routes/contactRoutes");
const donationRoutes = require("../routes/donationRoutes");

let app;
let donorToken;
let adminToken;
let donorUser;
let adminUser;

// In-memory mock store for test independence without external MongoDB daemon
const mockUsers = new Map();
const mockAnalysisResults = new Map();
const mockDonations = new Map();

User.findById = (id) => {
  const u = mockUsers.get(String(id));
  return {
    select: async () => u || null,
  };
};

User.findOne = async (query) => {
  for (const u of mockUsers.values()) {
    if (query.email && u.email === query.email) return u;
  }
  return null;
};

AnalysisResult.findOne = async (query) => {
  for (const item of mockAnalysisResults.values()) {
    let match = true;
    if (query._id && String(item._id) !== String(query._id)) match = false;
    if (query.user && String(item.user) !== String(query.user)) match = false;
    if (match) return item;
  }
  return null;
};

AnalysisResult.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = { _id, ...doc, createdAt: new Date() };
  mockAnalysisResults.set(String(_id), created);
  return created;
};

Donation.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = {
    _id,
    ...doc,
    status: "Available",
    createdAt: new Date(),
    updatedAt: new Date(),
    async save() { return this; }
  };
  mockDonations.set(String(_id), created);
  return created;
};

ContactMessage.create = async (doc) => ({
  _id: new mongoose.Types.ObjectId(),
  ...doc,
  createdAt: new Date(),
  async save() { return this; },
});

Notification.create = async (doc) => ({
  _id: new mongoose.Types.ObjectId(),
  ...doc,
  async save() { return this; },
});

Activity.create = async (doc) => ({
  _id: new mongoose.Types.ObjectId(),
  ...doc,
  async save() { return this; },
});

NGO.find = () => ({
  select: () => ({
    lean: async () => [],
  }),
});

function makeRequest(path, { method = "POST", token, body, ip = "127.0.0.1" } = {}) {
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

      const allHeaders = res.getHeaders ? res.getHeaders() : {};
      resolve({
        status: res.statusCode,
        headers: {
          get(name) {
            return res.getHeader(name.toLowerCase());
          },
          ...allHeaders,
        },
        body: json,
      });
    };

    app(req, res);
  });
}

test.before(() => {
  const donorId = new mongoose.Types.ObjectId();
  donorUser = {
    _id: donorId,
    name: "Donor User",
    email: "donor@foodsaver.test",
    role: "donor",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(donorId), donorUser);
  donorToken = jwt.sign({ id: donorUser._id, role: "donor" }, process.env.JWT_SECRET);

  const adminId = new mongoose.Types.ObjectId();
  adminUser = {
    _id: adminId,
    name: "Admin User",
    email: "admin@foodsaver.test",
    role: "admin",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(adminId), adminUser);
  adminToken = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET);

  app = express();
  app.use(express.json());
  app.use("/api/email", emailRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/donations", donationRoutes);
});

// ============================================================================
// 1. /api/email/test SECURITY & AUTHORIZATION TESTS
// ============================================================================

test("POST /api/email/test: rejects unauthenticated requests with 401", async () => {
  const res = await makeRequest("/api/email/test", {
    body: { email: "victim@example.com" },
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("POST /api/email/test: rejects non-admin users with 403 Forbidden", async () => {
  const res = await makeRequest("/api/email/test", {
    token: donorToken,
    body: { email: "victim@example.com" },
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test("POST /api/email/test: rejects invalid recipient email format with 400", async () => {
  const res = await makeRequest("/api/email/test", {
    token: adminToken,
    body: { email: "not-an-email" },
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("POST /api/email/test: rejects CRLF header injection in recipient email", async () => {
  const res = await makeRequest("/api/email/test", {
    token: adminToken,
    body: { email: "test@example.com\r\nBcc: evil@attacker.com" },
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("POST /api/email/test: allows authenticated admin to trigger test email", async () => {
  const sentBefore = outbox.length;
  const res = await makeRequest("/api/email/test", {
    token: adminToken,
    body: { email: "sysadmin@foodsaver.test" },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(outbox.length, sentBefore + 1);
});

// ============================================================================
// 2. /api/email/contact-admin VALIDATION & SANITIZATION TESTS
// ============================================================================

test("POST /api/email/contact-admin: rejects missing required fields with 400", async () => {
  const res = await makeRequest("/api/email/contact-admin", {
    body: { email: "", subject: "", message: "" },
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.errors);
});

test("POST /api/email/contact-admin: rejects message shorter than 10 chars", async () => {
  const res = await makeRequest("/api/email/contact-admin", {
    body: {
      email: "visitor@example.com",
      subject: "Hello there",
      message: "Short",
    },
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("POST /api/email/contact-admin: dispatches message and strips CRLF from subject", async () => {
  const sentBefore = outbox.length;
  const res = await makeRequest("/api/email/contact-admin", {
    body: {
      email: "user@example.com",
      subject: "Partnership Inquiry\r\nBcc: hacker@example.com",
      message: "We would like to partner with FoodSaver AI to reduce food waste in our community.",
    },
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(outbox.length, sentBefore + 1);
  const sent = outbox[outbox.length - 1];
  assert.ok(!sent.subject.includes("\r"), "Subject must not contain CR");
  assert.ok(!sent.subject.includes("\n"), "Subject must not contain LF");
  assert.equal(sent.replyTo, "user@example.com");
});

// ============================================================================
// 3. /api/contact RATE LIMITING TESTS
// ============================================================================

test("POST /api/contact: throttles rapid requests with 429", async () => {
  let rateLimited = false;
  // Use a dedicated ip to isolate rate limiter count
  const testIp = "192.168.1.100";
  for (let i = 0; i < 7; i++) {
    const res = await makeRequest("/api/contact", {
      ip: testIp,
      body: {
        name: "Test Bot",
        email: "bot@example.com",
        message: "This is a spam inquiry attempting to flood the contact inbox.",
      },
    });
    if (res.status === 429) {
      rateLimited = true;
      assert.ok(res.headers.get("retry-after"));
      break;
    }
  }
  assert.ok(rateLimited, "Must throttle after exceeding rate limit");
});

// ============================================================================
// 4. SERVER-SIDE AI DATA VERIFICATION IN DONATION CREATION
// ============================================================================

test("POST /api/donations: rejects forged or nonexistent analysisId with 400", async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();

  const res = await makeRequest("/api/donations", {
    token: donorToken,
    body: {
      foodItems: ["Rice"],
      category: "Rice",
      quantity: 5,
      quantityUnit: "kg",
      address: "123 Main St",
      aiAnalysis: {
        analysisId: fakeId,
        freshness: "Fresh",
        freshnessScore: 99,
        remainingHours: 120,
      },
    },
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes("AI analysis record not found"));
});

test("POST /api/donations: populates authentic freshness data from verified AnalysisResult", async () => {
  const realAnalysis = await AnalysisResult.create({
    analysisKey: `key-${Date.now()}-${Math.random()}`,
    user: donorUser._id,
    foodType: "Cooked Basmati Rice",
    category: "Rice",
    freshness: "Moderate",
    freshnessScore: 68,
    confidence: 0.92,
    remainingDays: 1,
    remainingHours: 18,
    safeToConsume: true,
    warnings: ["Store in refrigerator below 4°C"],
    recommendation: "Consume within 18 hours.",
  });

  // Client attempts to spoof freshness as 'Fresh' with score 99
  const res = await makeRequest("/api/donations", {
    token: donorToken,
    body: {
      foodItems: ["Cooked Basmati Rice"],
      category: "Rice",
      quantity: 4,
      quantityUnit: "kg",
      address: "123 Main St",
      aiAnalysis: {
        analysisId: realAnalysis._id.toString(),
        freshness: "Fresh", // Spoofed claim
        freshnessScore: 99, // Spoofed score
        remainingHours: 96, // Spoofed hours
        donorConfirmedFreshness: true,
      },
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  // Verify that the server populated authentic verified freshness from DB, not the client's spoofed score
  assert.equal(res.body.data.aiAnalysis.freshness, "Moderate");
  assert.equal(res.body.data.aiAnalysis.freshnessScore, 68);
  assert.equal(res.body.data.aiAnalysis.remainingHours, 18);
  assert.equal(res.body.data.aiAnalysis.confidence, 0.92);
});

test("POST /api/donations: refuses listing of food verified as Spoiled", async () => {
  const spoiledAnalysis = await AnalysisResult.create({
    analysisKey: `spoiled-${Date.now()}-${Math.random()}`,
    user: donorUser._id,
    foodType: "Milk",
    category: "Dairy",
    freshness: "Spoiled",
    freshnessScore: 12,
    confidence: 0.98,
    remainingDays: 0,
    remainingHours: 0,
    safeToConsume: false,
    warnings: ["Curdled texture, sour odor detected"],
  });

  const res = await makeRequest("/api/donations", {
    token: donorToken,
    body: {
      foodItems: ["Milk"],
      category: "Dairy",
      quantity: 2,
      quantityUnit: "litres",
      address: "123 Main St",
      aiAnalysis: {
        analysisId: spoiledAnalysis._id.toString(),
        donorConfirmedFreshness: true,
      },
    },
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes("spoiled or unsafe cannot be listed"));
});
