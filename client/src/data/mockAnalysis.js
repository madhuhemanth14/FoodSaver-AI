/**
 * Mock data for the AI Food Analysis module.
 *
 * This simulates the response shape that will eventually come from the
 * Python FastAPI service (POST /analyze-food). Once that service is live,
 * only src/services/aiAnalysisService.js needs to change — every component
 * and page in this module consumes data in this exact shape.
 */

export const FRESHNESS_STATES = ["Fresh", "Ripe", "Moderate", "Spoiled"];

export const mockAnalysisRecords = [
  {
    id: "analysis_001",
    foodType: "Tomato",
    emoji: "🍅",
    freshness: "Fresh",
    freshnessScore: 94,
    confidence: 0.94,
    predictedExpiry: "2026-08-18",
    remainingDays: 3,
    analyzedAt: "2026-08-15",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80",
    recommendation: "Safe to consume. Use within 3 days.",
  },
  {
    id: "analysis_002",
    foodType: "Banana",
    emoji: "🍌",
    freshness: "Ripe",
    freshnessScore: 88,
    confidence: 0.91,
    predictedExpiry: "2026-08-16",
    remainingDays: 1,
    analyzedAt: "2026-08-15",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
    recommendation: "Best eaten today. Great for baking if it turns spotty.",
  },
  {
    id: "analysis_003",
    foodType: "Apple",
    emoji: "🍎",
    freshness: "Fresh",
    freshnessScore: 90,
    confidence: 0.96,
    predictedExpiry: "2026-08-25",
    remainingDays: 10,
    analyzedAt: "2026-08-14",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80",
    recommendation: "Safe to consume. Store in the fridge to extend freshness.",
  },
  {
    id: "analysis_004",
    foodType: "Carrot",
    emoji: "🥕",
    freshness: "Moderate",
    freshnessScore: 68,
    confidence: 0.87,
    predictedExpiry: "2026-08-19",
    remainingDays: 4,
    analyzedAt: "2026-08-14",
    image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80",
    recommendation: "Slightly soft. Use soon in cooked dishes rather than raw.",
  },
  {
    id: "analysis_005",
    foodType: "Bread",
    emoji: "🍞",
    freshness: "Moderate",
    freshnessScore: 72,
    confidence: 0.85,
    predictedExpiry: "2026-08-17",
    remainingDays: 2,
    analyzedAt: "2026-08-13",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    recommendation: "Check for surface mold before eating. Toasting is recommended.",
  },
  {
    id: "analysis_006",
    foodType: "Rice",
    emoji: "🍚",
    freshness: "Fresh",
    freshnessScore: 97,
    confidence: 0.98,
    predictedExpiry: "2026-11-15",
    remainingDays: 92,
    analyzedAt: "2026-08-12",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    recommendation: "Safe to consume. Keep sealed in a cool, dry place.",
  },
  {
    id: "analysis_007",
    foodType: "Banana",
    emoji: "🍌",
    freshness: "Spoiled",
    freshnessScore: 22,
    confidence: 0.93,
    predictedExpiry: "2026-08-12",
    remainingDays: 0,
    analyzedAt: "2026-08-12",
    image: "https://images.unsplash.com/photo-1603833665858-e61a17a86224?w=400&q=80",
    recommendation: "Not recommended for direct consumption. Discard or compost.",
  },
  {
    id: "analysis_008",
    foodType: "Tomato",
    emoji: "🍅",
    freshness: "Ripe",
    freshnessScore: 81,
    confidence: 0.9,
    predictedExpiry: "2026-08-17",
    remainingDays: 2,
    analyzedAt: "2026-08-11",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
    recommendation: "Great for cooking now. Use within 2 days for best flavor.",
  },
];

export const getFreshnessMeta = (freshness) => {
  switch (freshness) {
    case "Fresh":
      return { color: "#2E7D32", bg: "#E8F5E9", label: "Fresh" };
    case "Ripe":
      return { color: "#66BB6A", bg: "#F1F8F2", label: "Ripe" };
    case "Moderate":
      return { color: "#F9A825", bg: "#FFF8E1", label: "Moderate" };
    case "Spoiled":
      return { color: "#C62828", bg: "#FDECEA", label: "Spoiled" };
    default:
      return { color: "#757575", bg: "#F5F5F5", label: freshness || "Unknown" };
  }
};
