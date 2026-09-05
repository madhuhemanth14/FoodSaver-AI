const AIAnalysis = require('../models/AIAnalysis');
const aiService = require('../services/aiService');

/**
 * Analyze food image and metadata
 * @route POST /api/analysis/analyze
 */
exports.analyzeFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required for analysis' });
    }

    const { foodName, category, preparedAt, expiryDate } = req.body;
    const metadata = { foodName, category, preparedAt, expiryDate };

    const imagePath = `/uploads/${req.file.filename}`;

    // Perform rule-based analysis
    const analysisResult = await aiService.analyzeFoodImage(imagePath, metadata);

    // Map service result fields to model schema
    const analysis = new AIAnalysis({
      user: req.user._id,
      image: imagePath,
      foodType: analysisResult.foodType,
      category: analysisResult.foodType,
      qualityAssessment: analysisResult.qualityAssessment,
      freshness: analysisResult.freshnessLabel,
      freshnessScore: analysisResult.freshnessScore,
      confidence: analysisResult.confidence,
      estimatedSafePeriod: analysisResult.estimatedSafePeriod,
      expiryEstimate: analysisResult.expiryEstimate,
      remainingHours: analysisResult.remainingHours,
      riskLevel: analysisResult.riskLevel,
      warnings: analysisResult.warnings,
      recommendations: analysisResult.recommendations,
    });

    await analysis.save();

    return res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in analyzeFood:', error);
    return res.status(500).json({ success: false, message: 'Server error during food analysis' });
  }
};

/**
 * Get user's analysis history
 * @route GET /api/analysis
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const history = await AIAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error in getAnalysisHistory:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving analysis history' });
  }
};

/**
 * Get a specific analysis by ID
 * @route GET /api/analysis/:id
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid analysis ID format' });
    }

    const analysis = await AIAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Check ownership
    if (analysis.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analysis' });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in getAnalysisById:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving analysis' });
  }
};
