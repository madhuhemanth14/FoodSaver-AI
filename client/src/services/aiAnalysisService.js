/**
 * AI Food Analysis service layer — now calls the real backend, which in
 * turn calls Google Gemini's vision API server-side (see
 * server/services/aiVisionService.js). No mock data, no Math.random()
 * fallback: a failed analysis throws a real error for the UI to show.
 */

import api from "./api";

/**
 * POST /api/ai/analyze
 * @param {File|null} imageFile - optional food photo (food type + name drive the estimate)
 * @returns {Promise<object>} an analysis result: { id, foodType, emoji,
 *   freshness, freshnessScore, confidence, predictedExpiry, predictedExpiryDate, predictedExpiryTime, remainingDays, remainingHours,
 *   recommendation, warnings, safeToConsume, analyzedAt }
 */
export const analyzeFoodImage = async (imageFile, preparationDate, preparationTime, foodDetails = {}) => {
  if (!imageFile && !(foodDetails.foodName || "").trim()) {
    throw new Error("Please enter a food name or select an image to analyze.");
  }

  const formData = new FormData();
  if (imageFile) formData.append("image", imageFile);
  if (preparationDate) formData.append("preparationDate", preparationDate);
  if (preparationTime) formData.append("preparationTime", preparationTime);
  if (foodDetails.foodName) formData.append("foodName", foodDetails.foodName);
  if (foodDetails.category) formData.append("category", foodDetails.category);
  if (foodDetails.quantity != null) formData.append("quantity", String(foodDetails.quantity));
  if (foodDetails.unit) formData.append("unit", foodDetails.unit);
  if (foodDetails.description) formData.append("description", foodDetails.description);

  try {
    const { data } = await api.post("/ai/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Attach a local preview URL for immediate display — the backend
    // doesn't persist/return the image binary itself.
    return imageFile ? { ...data, image: URL.createObjectURL(imageFile) } : data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      "AI analysis failed. Please try again.";

    // Temporary Gemini unavailability (the server already retried): show one
    // simple message. The UI offers a "Try Again" button that re-runs this
    // same request with the same inputs.
    if (err.response?.data?.retryable) {
      throw new Error(
        "AI analysis service is temporarily unavailable. Please try again in a few seconds."
      );
    }

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
