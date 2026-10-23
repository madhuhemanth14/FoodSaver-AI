const mongoose = require("mongoose");

// Persists a real AI analysis result for the authenticated user. Never
// created from mock/random data — only from a successful
// aiVisionService.analyzeFoodImage() response.
const analysisResultSchema = new mongoose.Schema(
  {
    analysisKey: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFood: { type: Boolean, default: true },
    foodType: { type: String, required: true, trim: true },
    foodName: { type: String, trim: true, default: "" },
    identifiedFoodName: { type: String, trim: true, default: "" },
    imageMatchesEntry: { type: Boolean, default: true },
    hasImage: { type: Boolean, default: false },
    category: { type: String, trim: true, default: "Other" },
    freshness: {
      type: String,
      enum: ["Fresh", "Ripe", "Moderate", "Spoiled"],
      required: true,
    },
    freshnessScore: { type: Number, required: true, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    remainingDays: { type: Number, required: true, min: 0 },
    remainingHours: { type: Number, required: true, min: 0 },
    predictedExpiry: { type: Date },
    safeToConsume: { type: Boolean, default: true },
    warnings: { type: [String], default: [] },
    recommendation: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

analysisResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);
