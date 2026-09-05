/**
 * AI Food Analysis service layer.
 *
 * Every function here returns data in the shape the future Python AI
 * service will return. Pages/components never know whether the data
 * came from a mock or a real API call — that's the point of this file.
 *
 * --------------------------------------------------------------------
 * FUTURE INTEGRATION (do this when the Python service is ready):
 *
 *   const AI_API_BASE_URL = "http://localhost:8000";
 *
 *   export const analyzeFoodImage = async (imageFile) => {
 *     const formData = new FormData();
 *     formData.append("image", imageFile);
 *     const res = await fetch(`${AI_API_BASE_URL}/analyze-food`, {
 *       method: "POST",
 *       body: formData,
 *     });
 *     if (!res.ok) throw new Error("Analysis failed");
 *     return res.json();
 *   };
 *
 *   export const getAnalysisHistory = async () => {
 *     const res = await fetch(`${AI_API_BASE_URL}/analysis-history`);
 *     if (!res.ok) throw new Error("Failed to load history");
 *     return res.json();
 *   };
 *
 *   export const getAnalysisById = async (id) => {
 *     const res = await fetch(`${AI_API_BASE_URL}/analysis/${id}`);
 *     if (!res.ok) throw new Error("Analysis not found");
 *     return res.json();
 *   };
 *
 * Swap the mock bodies below for the fetch calls above — no other file
 * in the module needs to change.
 * --------------------------------------------------------------------
 */

import { mockAnalysisRecords } from "../data/mockAnalysis";

const MOCK_DELAY_MS = 1800;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A small pool of possible outcomes so "Analyze Food" doesn't always
// return the same result during demos/testing.
const mockOutcomes = mockAnalysisRecords.slice(0, 6);
let mockIdCounter = mockAnalysisRecords.length + 1;

/**
 * Simulates POST /analyze-food
 * @param {File|null} imageFile - the uploaded food image (unused in mock)
 * @returns {Promise<object>} an analysis result matching the AI API contract
 */
export const analyzeFoodImage = async (imageFile) => {
  await wait(MOCK_DELAY_MS);

  // Simulate an occasional failure so error states can be exercised.
  if (Math.random() < 0.05) {
    throw new Error("AI analysis failed. Please try again.");
  }

  const base = mockOutcomes[Math.floor(Math.random() * mockOutcomes.length)];
  const newId = `analysis_${String(mockIdCounter++).padStart(3, "0")}`;

  const result = {
    success: true,
    id: newId,
    foodType: base.foodType,
    emoji: base.emoji,
    freshness: base.freshness,
    freshnessScore: base.freshnessScore,
    confidence: base.confidence,
    predictedExpiry: base.predictedExpiry,
    remainingDays: base.remainingDays,
    recommendation: base.recommendation,
    analyzedAt: new Date().toISOString().split("T")[0],
    image: imageFile ? URL.createObjectURL(imageFile) : base.image,
  };

  mockAnalysisRecords.unshift(result);
  return result;
};

/**
 * Simulates GET /analysis-history
 * @returns {Promise<object[]>}
 */
export const getAnalysisHistory = async () => {
  await wait(400);
  return [...mockAnalysisRecords];
};

/**
 * Simulates GET /analysis/:id
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getAnalysisById = async (id) => {
  await wait(300);
  const record = mockAnalysisRecords.find((r) => r.id === id);
  if (!record) {
    throw new Error(`Analysis record "${id}" not found.`);
  }
  return record;
};
