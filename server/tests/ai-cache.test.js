// Integration tests for Ticket 3: Fix AI Expiry Cache Inconsistency
// Verifies:
//   1. AI analysis generates deterministic shelf-life duration (remainingHours)
//   2. Cache hit re-uses stored AI analysis without calling Gemini API
//   3. When preparationDate or preparationTime changes, cache hit dynamically
//      recalculates predictedExpiry, predictedExpiryDate, and predictedExpiryTime
//   4. Changing preparation time by +6 hours advances predictedExpiry by exactly +6 hours
//   5. Persisted AnalysisResult document in DB is updated with the recalculated expiry

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-ticket-3-ai-cache";
process.env.EMAIL_USER = "noreply@foodsaver.test";
process.env.EMAIL_PASS = "dummy_password";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { EventEmitter } = require("events");

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AnalysisResult = require("../models/AnalysisResult");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");

Notification.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
Activity.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
const aiVisionService = require("../services/aiVisionService");

const aiRoutes = require("../routes/aiRoutes");

let app;
let donorUser;
let donorToken;

const mockUsers = new Map();
const mockAnalysisResults = new Map();
let visionApiCallCount = 0;

// Stub aiVisionService so we can test caching deterministically without hitting Gemini
aiVisionService.analyzeFoodImage = async (buffer, mime, prepDate, prepTime, details) => {
  visionApiCallCount++;
  return {
    isFood: true,
    foodType: details.foodName || "Cooked Rice",
    identifiedFoodName: details.foodName || "Cooked Rice",
    category: details.category || "Grain",
    freshness: "Fresh",
    freshnessScore: 92,
    confidence: 0.95,
    remainingDays: 1,
    remainingHours: 24, // 24 hours shelf life
    safeToConsume: true,
    warnings: ["Keep refrigerated below 4°C"],
    recommendation: "Consume within 24 hours.",
    imageMatchesEntry: true,
  };
};

User.findById = (id) => {
  const u = mockUsers.get(String(id));
  return {
    select: async () => u || null,
  };
};

AnalysisResult.findOne = async (query) => {
  for (const item of mockAnalysisResults.values()) {
    if (query.analysisKey && item.analysisKey === query.analysisKey) {
      return { ...item };
    }
  }
  return null;
};

AnalysisResult.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = {
    _id,
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockAnalysisResults.set(String(_id), created);
  return { ...created };
};

AnalysisResult.findByIdAndUpdate = async (id, update) => {
  const item = mockAnalysisResults.get(String(id));
  if (!item) return null;
  const up = update.$set || update;
  const updated = { ...item, ...up, updatedAt: new Date() };
  mockAnalysisResults.set(String(id), updated);
  return { ...updated };
};

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

      resolve({
        status: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
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
    name: "Donor Chef",
    email: "chef@foodsaver.test",
    role: "donor",
    isEmailVerified: true,
    isBlocked: false,
  };
  mockUsers.set(String(donorId), donorUser);
  donorToken = jwt.sign({ id: donorUser._id, role: "donor" }, process.env.JWT_SECRET);

  app = express();
  app.use(express.json());
  app.use("/api/ai", aiRoutes);
});

test("Ticket 3: Initial analysis computes predictedExpiry = prepDateTime + remainingHours", async () => {
  const res = await makeRequest("/api/ai/analyze", {
    method: "POST",
    token: donorToken,
    body: {
      foodName: "Vegetable Biryani",
      category: "Cooked Meal",
      preparationDate: "2026-11-10",
      preparationTime: "10:00",
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.remainingHours, 24);
  assert.equal(visionApiCallCount, 1, "Vision AI service was called for initial analysis");

  // 2026-11-10 10:00 + 24 hours -> 2026-11-11 10:00
  const expectedDate = new Date("2026-11-10T10:00:00");
  expectedDate.setTime(expectedDate.getTime() + 24 * 3600000);

  const actualDate = new Date(res.body.predictedExpiry);
  assert.equal(actualDate.getTime(), expectedDate.getTime());
});

test("Ticket 3: Changing preparation time by +6 hours updates predictedExpiry by +6 hours on cache hit", async () => {
  const callsBefore = visionApiCallCount;

  // Donor changes prep time from 10:00 to 16:00 (advances by +6 hours)
  const res = await makeRequest("/api/ai/analyze", {
    method: "POST",
    token: donorToken,
    body: {
      foodName: "Vegetable Biryani",
      category: "Cooked Meal",
      preparationDate: "2026-11-10",
      preparationTime: "16:00", // +6 hours change
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(visionApiCallCount, callsBefore, "Gemini API must NOT be called on cache hit");

  // Expected expiry: 2026-11-10 16:00 + 24 hours = 2026-11-11 16:00
  const expectedDate = new Date("2026-11-10T16:00:00");
  expectedDate.setTime(expectedDate.getTime() + 24 * 3600000);

  const actualDate = new Date(res.body.predictedExpiry);
  assert.equal(
    actualDate.getTime(),
    expectedDate.getTime(),
    "predictedExpiry must advance by exactly +6 hours to match the new preparation time"
  );
  assert.equal(res.body.predictedExpiryTime, expectedDate.toISOString().split("T")[1].slice(0, 5));
});

test("Ticket 3: Changing preparation date by +2 days updates predictedExpiry by +48 hours on cache hit", async () => {
  const callsBefore = visionApiCallCount;

  // Donor changes prep date from 2026-11-10 to 2026-11-12
  const res = await makeRequest("/api/ai/analyze", {
    method: "POST",
    token: donorToken,
    body: {
      foodName: "Vegetable Biryani",
      category: "Cooked Meal",
      preparationDate: "2026-11-12",
      preparationTime: "16:00",
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(visionApiCallCount, callsBefore, "Gemini API must NOT be called on cache hit");

  const expectedDate = new Date("2026-11-12T16:00:00");
  expectedDate.setTime(expectedDate.getTime() + 24 * 3600000);

  const actualDate = new Date(res.body.predictedExpiry);
  assert.equal(actualDate.getTime(), expectedDate.getTime());

  // Also verify persisted AnalysisResult in DB was updated
  const stored = mockAnalysisResults.get(String(res.body.id));
  assert.ok(stored);
  assert.equal(new Date(stored.predictedExpiry).getTime(), expectedDate.getTime());
});
