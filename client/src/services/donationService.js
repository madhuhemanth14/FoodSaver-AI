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

function normalizeUnit(unit) {
  if (!unit) return "kg";
  const u = String(unit).toLowerCase().trim();
  if (u === "liters" || u === "litres") return "litres";
  if (u === "packets" || u === "boxes") return "packets";
  if (u === "items" || u === "pieces" || u === "servings") return "items";
  return "kg";
}

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
    quantityUnit: normalizeUnit(payload.unit),
    description: payload.description || "",
    address: payload.location,
    preparationDate:
      payload.preparationDate && payload.preparationTime
        ? `${payload.preparationDate}T${payload.preparationTime}:00`
        : payload.preparationDate || undefined,
    expiryDate: payload.aiAnalysis?.predictedExpiry || undefined,
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

/**
 * PATCH /api/donations/:id/accept — NGO claims an available donation.
 * The backend rejects expired or already-claimed donations.
 */
export async function acceptDonation(id) {
  const response = await api.patch(`/donations/${id}/accept`);
  return response.data.data;
}

/**
 * PATCH /api/donations/:id/reject — the accepting NGO releases the donation
 * before scheduling a pickup (it becomes Available again if not expired).
 */
export async function rejectDonation(id) {
  const response = await api.patch(`/donations/${id}/reject`);
  return response.data.data;
}

export default {
  acceptDonation,
  rejectDonation,
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
};
