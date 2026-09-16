const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  image: { type: String, required: true },
  foodType: { type: String, default: 'Unknown' },
  category: { type: String, default: 'General' },
  qualityAssessment: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Expired'], default: 'Good' },
  freshness: { type: String, enum: ['Very Fresh', 'Fresh', 'Moderate', 'Stale', 'Spoiled'], default: 'Fresh' },
  freshnessScore: { type: Number, min: 0, max: 100, default: 75 },
  confidence: { type: Number, min: 0, max: 100, default: 80 },
  estimatedSafePeriod: { type: String },
  expiryEstimate: { type: Date },
  remainingHours: { type: Number },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  warnings: [{ type: String }],
  recommendations: [{ type: String }]
}, { timestamps: true });

aiAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
