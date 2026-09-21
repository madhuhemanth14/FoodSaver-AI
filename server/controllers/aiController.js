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
    category: doc.category,
    emoji: EMOJI_BY_CATEGORY[doc.category] || EMOJI_BY_CATEGORY.Other,
    freshness: doc.freshness,
    freshnessScore: doc.freshnessScore,
    confidence: doc.confidence,
    remainingDays: doc.remainingDays,
    predictedExpiry: doc.predictedExpiry ? doc.predictedExpiry.toISOString().split("T")[0] : null,
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
    if (!req.file) {
      return res.status(400).json({ success: false, message: "An image file is required." });
    }
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type "${req.file.mimetype}". Use JPEG, PNG, or WEBP.`,
      });
    }
    if (req.file.size > MAX_FILE_BYTES) {
      return res.status(400).json({ success: false, message: "Image must be 8MB or smaller." });
    }

    let analysis;
    try {
      analysis = await runVisionAnalysis(req.file.buffer, req.file.mimetype);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError.code || "", aiError.message);
      // Genuine failure — no random/mock fallback, per product spec.
      const status = aiError.code === "AI_NOT_CONFIGURED" ? 503 : 502;
      return res.status(status).json({ success: false, message: aiError.message });
    }

    const remainingDays = Math.max(0, Math.round(analysis.remainingDays));
    const predictedExpiry = new Date();
    predictedExpiry.setDate(predictedExpiry.getDate() + remainingDays);

    const saved = await AnalysisResult.create({
      user: req.user._id,
      isFood: analysis.isFood,
      foodType: analysis.foodType,
      category: analysis.category,
      freshness: analysis.freshness,
      freshnessScore: Math.round(analysis.freshnessScore),
      confidence: analysis.confidence,
      remainingDays,
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
