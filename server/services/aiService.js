/**
 * aiService.js
 * Rule-based food analysis service.
 */

/**
 * Helper to determine category if not directly provided
 */
const guessCategory = (foodName) => {
  const name = (foodName || '').toLowerCase();
  if (name.includes('curry') || name.includes('rice') || name.includes('meal') || name.includes('pasta')) return 'Cooked Meal';
  if (name.includes('bread') || name.includes('cake') || name.includes('pastry')) return 'Bakery';
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) return 'Dairy';
  if (name.includes('apple') || name.includes('banana') || name.includes('fruit')) return 'Fruit';
  if (name.includes('tomato') || name.includes('potato') || name.includes('salad')) return 'Vegetable';
  if (name.includes('juice') || name.includes('water')) return 'Beverage';
  return 'Packaged';
};

/**
 * Get typical shelf life in hours for a category
 */
const getShelfLifeHours = (category) => {
  const times = {
    'Cooked Meal': 6,
    'Bakery': 48,
    'Dairy': 72,
    'Fruit': 96,
    'Vegetable': 120,
    'Beverage': 168,
    'Packaged': 720
  };
  return times[category] || 24;
};

/**
 * analyzeFoodImage(imagePath, metadata)
 * 
 * @param {string} imagePath - path to uploaded image
 * @param {object} metadata - { foodName, category, preparedAt, expiryDate }
 * @returns {object} analysis result
 *
 * This is a rule-based analysis engine. It classifies food, assesses quality,
 * and predicts expiry based on food type characteristics and preparation time.
 */
exports.analyzeFoodImage = async (imagePath, metadata) => {
  // Simulate some async processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const foodName = metadata.foodName || 'Unknown Food';
  const category = metadata.category || guessCategory(foodName);
  const preparedAt = metadata.preparedAt ? new Date(metadata.preparedAt) : new Date();
  
  // Calculate shelf life and hours elapsed
  const totalShelfLife = getShelfLifeHours(category);
  const now = new Date();
  const elapsedMs = now.getTime() - preparedAt.getTime();
  let elapsedHours = elapsedMs / (1000 * 60 * 60);
  if (elapsedHours < 0) elapsedHours = 0;

  const remainingHoursRaw = totalShelfLife - elapsedHours;
  const remainingHours = Math.max(0, parseFloat(remainingHoursRaw.toFixed(1)));

  // Freshness score 0-100
  let freshnessScore = 100 - ((elapsedHours / totalShelfLife) * 100);
  // Add some randomness (-5 to +5)
  freshnessScore += (Math.random() * 10 - 5);
  freshnessScore = Math.max(0, Math.min(100, Math.round(freshnessScore)));

  // Quality Assessment
  let qualityAssessment = '';
  if (freshnessScore >= 90) qualityAssessment = 'Excellent';
  else if (freshnessScore >= 70) qualityAssessment = 'Good';
  else if (freshnessScore >= 50) qualityAssessment = 'Fair';
  else if (freshnessScore >= 30) qualityAssessment = 'Poor';
  else qualityAssessment = 'Expired/Spoiled';

  // Freshness Label
  let freshnessLabel = '';
  if (freshnessScore >= 90) freshnessLabel = 'Very Fresh';
  else if (freshnessScore >= 70) freshnessLabel = 'Fresh';
  else if (freshnessScore >= 50) freshnessLabel = 'Moderate';
  else if (freshnessScore >= 30) freshnessLabel = 'Stale';
  else freshnessLabel = 'Spoiled';

  // Confidence
  let confidence = 75;
  if (metadata.preparedAt) confidence += 10;
  if (metadata.category) confidence += 5;
  confidence += Math.floor(Math.random() * 5); // Some randomness
  confidence = Math.min(99, confidence);

  // Warnings & Recommendations
  const warnings = [];
  const recommendations = [];

  if (freshnessScore < 30) {
    warnings.push('Food appears to be spoiled or past its safe consumption period.');
    recommendations.push('Not recommended for donation.');
    recommendations.push('Dispose of safely.');
  } else if (freshnessScore < 60) {
    warnings.push('Food quality is degrading.');
    warnings.push('Consume or distribute immediately.');
    recommendations.push('Distribute quickly.');
  } else {
    recommendations.push('Suitable for immediate donation.');
    if (['Cooked Meal', 'Dairy'].includes(category)) {
      warnings.push('Keep refrigerated to maintain freshness.');
    }
  }

  // Risk Level
  let riskLevel = 'Low';
  if (freshnessScore < 30) riskLevel = 'Critical';
  else if (freshnessScore < 50) riskLevel = 'High';
  else if (freshnessScore < 70) riskLevel = 'Medium';

  // Estimated Safe Period
  let estimatedSafePeriod = '';
  if (remainingHours > 48) {
    estimatedSafePeriod = `${Math.floor(remainingHours / 24)} days`;
  } else if (remainingHours > 0) {
    estimatedSafePeriod = `${Math.floor(remainingHours)} hours`;
  } else {
    estimatedSafePeriod = '0 hours';
  }

  // Expiry Estimate
  const expiryEstimate = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);

  return {
    foodType: category,
    confidence: confidence,
    qualityAssessment: qualityAssessment,
    freshnessLabel: freshnessLabel,
    freshnessScore: freshnessScore,
    estimatedSafePeriod: estimatedSafePeriod,
    remainingHours: remainingHours,
    expiryEstimate: expiryEstimate,
    warnings: warnings,
    recommendations: recommendations,
    riskLevel: riskLevel
  };
};
