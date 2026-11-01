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

function normalizeDonation(doc) {
  if (!doc) return null;
  const id = doc.id || (doc._id ? String(doc._id) : "");
  const foodName =
    doc.foodName ||
    (Array.isArray(doc.foodItems) && doc.foodItems.length > 0
      ? doc.foodItems.join(", ")
      : doc.foodItems || "Food Donation");
  const unit = doc.unit || doc.quantityUnit || "kg";
  const location = doc.location || doc.address || "";
  const freshness = doc.freshness || doc.aiAnalysis?.freshness || "";
  const confidence = doc.confidence != null ? doc.confidence : doc.aiAnalysis?.confidence;
  const predictedExpiry = doc.predictedExpiry || doc.expiryDate || doc.aiAnalysis?.predictedExpiry;
  const localPhoto =
    (id && (localStorage.getItem(`fs_donation_img_${id}`) || localStorage.getItem(`fs_img_${id}`))) ||
    "";
  const photo = doc.image || doc.imageUrl || doc.photo || localPhoto || "";

  return {
    ...doc,
    id,
    _id: id,
    foodName,
    foodItems: Array.isArray(doc.foodItems) ? doc.foodItems : [foodName],
    unit,
    quantityUnit: unit,
    location,
    address: location,
    freshness,
    confidence,
    predictedExpiry,
    image: photo,
    imageUrl: photo,
  };
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
  let photo = payload.imageUrl || payload.imagePreviewUrl || payload.image || "";
  if ((!photo || (typeof photo === "string" && photo.startsWith("blob:"))) && payload.imageFile instanceof File) {
    try {
      photo = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(payload.imageFile);
      });
    } catch {}
  }
  if (typeof photo === "string" && photo.startsWith("blob:")) {
    photo = "";
  }

  // Safety guard: ensure base64 photo is well under the 100KB default express body limit
  if (typeof photo === "string" && photo.startsWith("data:image/") && photo.length > 70000) {
    try {
      photo = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const maxDim = 540;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.55));
          } catch {
            resolve(photo);
          }
        };
        img.onerror = () => resolve(photo);
        img.src = photo;
      });
    } catch {}
  }

  const body = {
    foodItems: [payload.foodName],
    category: payload.category,
    quantity: Number(payload.quantity),
    quantityUnit: normalizeUnit(payload.unit),
    description: payload.description || "",
    address: payload.location,
    imageUrl: photo,
    image: photo,
    preparationDate:
      payload.preparationDate && payload.preparationTime
        ? `${payload.preparationDate}T${payload.preparationTime}:00`
        : payload.preparationDate || undefined,
    expiryDate: payload.aiAnalysis?.predictedExpiry || undefined,
    aiAnalysis: payload.aiAnalysis
      ? {
          foodType: payload.aiAnalysis.foodType,
          freshness: payload.aiAnalysis.freshness,
          freshnessScore: payload.aiAnalysis.freshnessScore,
          confidence: payload.aiAnalysis.confidence,
          recommendation: payload.aiAnalysis.recommendation,
          remainingHours: payload.aiAnalysis.remainingHours,
          predictedExpiry: payload.aiAnalysis.predictedExpiry,
          donorConfirmedFreshness: Boolean(payload.aiAnalysis.donorConfirmedFreshness),
          donorConfirmedAt: payload.aiAnalysis.donorConfirmedAt || new Date().toISOString(),
          donorPhysicalCheck: payload.aiAnalysis.donorPhysicalCheck || {
            appearanceNormal: true,
            odorNormal: true,
            temperatureMaintained: true,
          },
          analyzedAt: payload.aiAnalysis.analyzedAt || new Date().toISOString(),
        }
      : undefined,
  };

  try {
    const response = await api.post("/donations", body);
    const normalized = normalizeDonation(response.data.data);
    const photoToSave = photo || payload.imageUrl || payload.imagePreviewUrl || payload.image || "";
    if (photoToSave && normalized) {
      const dId = String(normalized.id || normalized._id || "");
      if (dId) {
        try {
          localStorage.setItem(`fs_donation_img_${dId}`, photoToSave);
          localStorage.setItem(`fs_img_${dId}`, photoToSave);
          localStorage.setItem("fs_latest_donation_image", photoToSave);
        } catch {}
      }
      normalized.image = normalized.image || photoToSave;
      normalized.imageUrl = normalized.imageUrl || photoToSave;
    }
    return normalized;
  } catch (error) {
    if (error.response?.status === 413 && (body.imageUrl || body.image)) {
      console.warn("Payload rejected with 413. Retrying donation without image binary...");
      const compact = { ...body, imageUrl: "", image: "" };
      const fallback = await api.post("/donations", compact);
      const normalized = normalizeDonation(fallback.data.data);
      const photoToSave = photo || payload.imageUrl || payload.imagePreviewUrl || payload.image || "";
      if (photoToSave && normalized) {
        const dId = String(normalized.id || normalized._id || "");
        if (dId) {
          try {
            localStorage.setItem(`fs_donation_img_${dId}`, photoToSave);
            localStorage.setItem(`fs_img_${dId}`, photoToSave);
            localStorage.setItem("fs_latest_donation_image", photoToSave);
          } catch {}
        }
        normalized.image = photoToSave;
        normalized.imageUrl = photoToSave;
      }
      return normalized;
    }
    throw error;
  }
}

/**
 * GET /api/donations — scoped server-side to the authenticated donor.
 * @returns {Promise<object[]>}
 */
export async function getMyDonations() {
  const response = await api.get("/donations");
  return Array.isArray(response.data.data)
    ? response.data.data.map(normalizeDonation)
    : [];
}

/**
 * GET /api/donations/:id
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getDonationById(id) {
  if (!id || id === "undefined" || id === "null") return null;
  try {
    const response = await api.get(`/donations/${id}`);
    return normalizeDonation(response.data.data);
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 400) {
      return null;
    }
    throw error;
  }
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
