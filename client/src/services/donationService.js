// src/services/donationService.js
//
// Food Donation Module — Service Layer, wired to the real backend
// (server/controllers/donationController.js). Uses the shared `api`
// axios instance so every request carries the caller's JWT — required
// now that /api/donations is requireAuth-protected.
//
//   createDonation(payload)   -> POST   /api/donations
//   getMyDonations()          -> GET    /api/donations
//   getDonationById(id)       -> GET    /api/donations/:id
//   cancelDonation(id)        -> PATCH  /api/donations/:id/cancel
//
// NOTE: the AI analysis step of this flow now calls the same real
// backend as the standalone Food Analysis page — see
// aiAnalysisService.analyzeFoodImage. The mock analyzeFoodImage that used
// to live here (random freshness via Math.random()) has been removed.

import api from "./api";

/**
 * POST /api/donations
 * Donor identity (name/email/phone) is derived server-side from the
 * authenticated user — this payload only carries what the server can't
 * infer about the donation itself.
 * @param {object} payload - form fields + aiAnalysis (see DonateFood.jsx)
 * @returns {Promise<object>} the created donation record
 */
export async function createDonation(payload) {
  const body = {
    foodItems: [payload.foodName],
    category: payload.category,
    quantity: Number(payload.quantity),
    quantityUnit: payload.unit,
    description: payload.description || "",
    address: payload.location,
    preparationDate: payload.preparationDate || undefined,
    expiryDate: payload.aiAnalysis?.predictedExpiry || payload.expiryDate || undefined,
    aiAnalysis: payload.aiAnalysis
      ? {
          foodType: payload.aiAnalysis.foodType,
          freshness: payload.aiAnalysis.freshness,
          confidence: payload.aiAnalysis.confidence,
          recommendation: payload.aiAnalysis.recommendation,
          predictedExpiry: payload.aiAnalysis.predictedExpiry,
          analyzedAt: new Date().toISOString(),
        }
      : undefined,
  };

  const response = await api.post("/donations", body);
  return response.data.data;
}

/**
 * GET /api/donations — scoped server-side to the authenticated donor.
 * @returns {Promise<object[]>}
 */
export async function getMyDonations() {
  const response = await api.get("/donations");
  return response.data.data;
}

/**
 * GET /api/donations/:id
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getDonationById(id) {
  const response = await api.get(`/donations/${id}`);
  return response.data.data;
}

/**
 * PATCH /api/donations/:id/cancel
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function cancelDonation(id) {
  const response = await api.patch(`/donations/${id}/cancel`);
  return response.data.data;
}

export default {
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
};
