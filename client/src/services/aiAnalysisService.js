/**
 * AI Food Analysis service layer — now calls the real backend, which in
 * turn calls Google Gemini's vision API server-side (see
 * server/services/aiVisionService.js). No mock data, no Math.random()
 * fallback: a failed analysis throws a real error for the UI to show.
 */

import api from "./api";

/**
 * POST /api/ai/analyze
 * @param {File} imageFile - the uploaded food image
 * @returns {Promise<object>} an analysis result: { id, foodType, emoji,
 *   freshness, freshnessScore, confidence, predictedExpiry, remainingDays,
 *   recommendation, warnings, safeToConsume, analyzedAt }
 */
export const analyzeFoodImage = async (imageFile) => {
  if (!imageFile) {
    throw new Error("Please select an image to analyze.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const { data } = await api.post("/ai/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Attach a local preview URL for immediate display — the backend
    // doesn't persist/return the image binary itself.
    return { ...data, image: URL.createObjectURL(imageFile) };
  } catch (err) {
    const message =
      err.response?.data?.message ||
      "AI analysis failed. Please try again.";
    throw new Error(message);
  }
};

/**
 * GET /api/ai/history — the current user's own analysis history.
 * @returns {Promise<object[]>}
 */
export const getAnalysisHistory = async () => {
  const { data } = await api.get("/ai/history");
  return data.data;
};

/**
 * GET /api/ai/history/:id
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getAnalysisById = async (id) => {
  try {
    const { data } = await api.get(`/ai/history/${id}`);
    return data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Analysis record "${id}" not found.`);
    }
    throw new Error(err.response?.data?.message || "Failed to load analysis record.");
  }
};
