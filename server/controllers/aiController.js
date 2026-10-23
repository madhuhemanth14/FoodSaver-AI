const crypto = require("crypto");
const AnalysisResult = require("../models/AnalysisResult");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const { analyzeFoodImage: runVisionAnalysis } = require("../services/aiVisionService");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

// A small, presentational-only emoji map. Never affects the analysis
// itself — purely cosmetic for the existing frontend cards.
const EMOJI_BY_CATEGORY = {
  Fruit: "🍎",
  Vegetable: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  "Cooked Meal": "🍲",
  Grain: "🌾",
  "Meat/Seafood": "🍗",
  Beverage: "🥤",
  Other: "🍽️",
};

// NOTE (Phase 2 TODO): no object storage (S3/GCS/Cloudinary) is configured,
// so the original uploaded photo isn't persisted — only the analysis
// result is. History/detail views therefore get a neutral placeholder
// image instead of a broken <img> tag. Wiring real image storage is
// required before this is a true "photo history", not just a data log.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="100%" height="100%" fill="#eef2ee"/>' +
      '<text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🍽️</text>' +
      "</svg>"
  );

function toContractShape(doc) {
  return {
    success: true,
    id: doc._id.toString(),
    isFood: doc.isFood,
    foodType: doc.foodType,
    foodName: doc.foodName || doc.foodType,
    identifiedFoodName: doc.identifiedFoodName || doc.foodType,
    imageMatchesEntry: doc.imageMatchesEntry !== false,
    hasImage: !!doc.hasImage,
    category: doc.category,
    emoji: EMOJI_BY_CATEGORY[doc.category] || EMOJI_BY_CATEGORY.Other,
    freshness: doc.freshness,
    freshnessScore: doc.freshnessScore,
    confidence: doc.confidence,
    remainingDays: doc.remainingDays,
    remainingHours: doc.remainingHours,
    predictedExpiry: doc.predictedExpiry ? doc.predictedExpiry.toISOString() : null,
    predictedExpiryDate: doc.predictedExpiry ? doc.predictedExpiry.toISOString().split("T")[0] : null,
    predictedExpiryTime: doc.predictedExpiry ? doc.predictedExpiry.toISOString().split("T")[1].slice(0, 5) : null,
    safeToConsume: doc.safeToConsume,
    warnings: doc.warnings,
    recommendation: doc.recommendation,
    analyzedAt: doc.createdAt.toISOString().split("T")[0],
    image: PLACEHOLDER_IMAGE,
  };
}

// POST /api/ai/analyze  (multipart/form-data, field name "image")
const analyzeFood = async (req, res) => {
  try {
    // The photo is optional. Food type + food name are what drive the estimate.
    if (req.file) {
      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type "${req.file.mimetype}". Use JPEG, PNG, or WEBP.`,
        });
      }
      if (req.file.size > MAX_FILE_BYTES) {
        return res.status(400).json({ success: false, message: "Image must be 8MB or smaller." });
      }
    }

    const preparationDate = String(req.body?.preparationDate || "").trim();
    const preparationTime = String(req.body?.preparationTime || "").trim();
    const foodDetails = {
      foodName: String(req.body?.foodName || "").trim(),
      category: String(req.body?.category || "").trim(),
      quantity: String(req.body?.quantity || "").trim(),
      unit: String(req.body?.unit || "").trim(),
      description: String(req.body?.description || "").trim(),
    };

    // Photo-only requests (standalone Food Analysis page) are still allowed.
    // Without a photo, food type + food name are mandatory.
    if (!req.file) {
      if (!String(req.body?.foodName || "").trim()) {
        return res.status(400).json({ success: false, message: "Please enter a food name." });
      }
      if (!String(req.body?.category || "").trim()) {
        return res.status(400).json({ success: false, message: "Please select a food type." });
      }
    }

    if (preparationDate && !/^\d{4}-\d{2}-\d{2}$/.test(preparationDate)) {
      return res.status(400).json({ success: false, message: "Invalid preparation date." });
    }
    if (preparationTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(preparationTime)) {
      return res.status(400).json({ success: false, message: "Invalid preparation time." });
    }

    // Deterministic cache: shelf life is tied to food type + food name (+ the
    // photo when one is supplied), NOT to the preparation timestamp. The
    // preparation date/time only places the fixed duration on the calendar,
    // so editing it never needs another AI call. The same inputs always
    // return the stored result. Quantity/unit/description don't affect it.
    const imageHash = req.file
      ? crypto.createHash("sha256").update(req.file.buffer).digest("hex")
      : "";

    const analysisKey = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          userId: String(req.user._id),
          imageHash,
          foodName: foodDetails.foodName.toLowerCase().replace(/\s+/g, " "),
          category: foodDetails.category.toLowerCase(),
        })
      )
      .digest("hex");

    const cached = await AnalysisResult.findOne({ analysisKey });
    if (cached) {
      return res.status(200).json(toContractShape(cached));
    }

    let analysis;
    try {
      analysis = await runVisionAnalysis(
        req.file ? req.file.buffer : null,
        req.file ? req.file.mimetype : null,
        preparationDate || null,
        preparationTime || null,
        foodDetails
      );
    } catch (aiError) {
      // Full technical detail stays in the server log.
      console.error(
        "AI analysis failed:",
        aiError.code || "",
        aiError.technicalMessage || aiError.message
      );
      // Genuine failure — no random/mock fallback, per product spec, and
      // nothing is saved to AnalysisResult, so a failed attempt can never be
      // mistaken for (or cached as) a successful analysis.
      // Temporary provider failures (after the service's own retries) get a
      // short friendly message plus retryable: true so the UI offers "Try Again".
      if (aiError.temporary) {
        return res.status(503).json({
          success: false,
          message: aiError.message,
          retryable: true,
        });
      }
      const status = aiError.code === "AI_NOT_CONFIGURED" ? 503 : 502;
      return res.status(status).json({
        success: false,
        message: aiError.message,
        retryable: false,
      });
    }

    const remainingHours = Math.max(0, Math.round(Number(analysis.remainingHours)));
    if (!Number.isFinite(remainingHours)) {
      return res.status(502).json({ success: false, message: "AI analysis returned an invalid expiry-time estimate." });
    }

    const remainingDays = Math.max(0, Math.floor(remainingHours / 24));
    const predictedExpiry = new Date(
      preparationDate ? `${preparationDate}T${preparationTime || "00:00"}:00` : Date.now()
    );
    if (Number.isNaN(predictedExpiry.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid preparation date or time." });
    }
    predictedExpiry.setTime(predictedExpiry.getTime() + remainingHours * 60 * 60 * 1000);

    const saved = await AnalysisResult.create({
      analysisKey,
      user: req.user._id,
      isFood: analysis.isFood,
      foodType: analysis.foodType,
      foodName: foodDetails.foodName || analysis.foodType,
      identifiedFoodName: analysis.identifiedFoodName,
      imageMatchesEntry: analysis.imageMatchesEntry,
      hasImage: !!req.file,
      category: analysis.category,
      freshness: analysis.freshness,
      freshnessScore: Math.round(analysis.freshnessScore),
      confidence: analysis.confidence,
      remainingDays,
      remainingHours,
      predictedExpiry,
      safeToConsume: analysis.safeToConsume,
      warnings: analysis.warnings || [],
      recommendation: analysis.recommendation,
    });

    res.status(201).json(toContractShape(saved));

    // Real in-app notification for "AI analysis completed" — fire-and-forget,
    // after the response, so a notification failure never affects the result.
    Notification.create({
      userId: req.user._id,
      type: "ai",
      title: "Food analysis completed",
      message: `${saved.foodType || "Your food"} was analyzed as ${saved.freshness.toLowerCase()} (${saved.freshnessScore}% freshness).`,
    }).catch((notifyErr) => console.error("AI analysis notification failed:", notifyErr.message));

    Activity.create({
      userId: req.user._id,
      type: "ai",
      title: "AI analysis completed",
      description: `${saved.foodType || "Food"} — ${saved.freshness}`,
      status: "completed",
    }).catch((activityErr) => console.error("AI analysis activity log failed:", activityErr.message));
  } catch (error) {
    console.error("analyzeFood error:", error);
    res.status(500).json({ success: false, message: "Analysis failed. Please try again." });
  }
};
// GET /api/ai/history — the authenticated user's own analysis history only.
const getHistory = async (req, res) => {
  try {
    const records = await AnalysisResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: records.length, data: records.map(toContractShape) });
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ success: false, message: "Failed to load analysis history." });
  }
};

// GET /api/ai/history/:id
const getHistoryById = async (req, res) => {
  try {
    const record = await AnalysisResult.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Analysis record not found." });
    }
    if (!record.user.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have access to this record." });
    }
    res.json({ success: true, data: toContractShape(record) });
  } catch (error) {
    console.error("getHistoryById error:", error);
    res.status(500).json({ success: false, message: "Failed to load analysis record." });
  }
};

module.exports = { analyzeFood, getHistory, getHistoryById };
