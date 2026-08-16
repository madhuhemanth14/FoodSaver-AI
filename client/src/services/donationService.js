// src/services/donationService.js
//
// MEMBER 3 — Food Donation Module — Service Layer
//
// This file is the ONLY place that talks to "the backend". Every function
// returns a Promise, exactly like an Axios call would, so the mock
// implementations below can be swapped for real HTTP calls later without
// touching any component.
//
//   React Component  →  donationService.js  →  Future Node.js API
//
// -----------------------------------------------------------------------
// FUTURE API MAPPING (do not implement — for reference only):
//
//   createDonation(payload)   → POST   /api/donations
//   getMyDonations()          → GET    /api/donations
//   getDonationById(id)       → GET    /api/donations/:id
//   cancelDonation(id)        → PATCH  /api/donations/:id/cancel
//   analyzeFoodImage(file)    → POST   /api/ai/analyze-food
//
// To connect the real backend, uncomment the Axios version inside each
// function and remove the mock implementation — the function signature
// and return shape should stay the same so components need no changes.
// -----------------------------------------------------------------------

import mockDonationsSeed, { FRESHNESS_LEVELS } from "../data/mockDonations";

// import axios from "axios";
// const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

const NETWORK_DELAY_MS = 700;

// In-memory store so donations created during the session show up in
// history/details without a real backend. Resets on page refresh.
let donationsStore = [...mockDonationsSeed];
let idCounter = donationsStore.length + 1;

function delay(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDonationId() {
  const padded = String(idCounter).padStart(3, "0");
  idCounter += 1;
  return `FS-2026-${padded}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Simulates POST /api/ai/analyze-food
 * Sends a food image (and optionally the declared expiry date) for AI
 * freshness/expiry analysis. Currently returns randomized mock data.
 *
 * @param {File} imageFile
 * @param {{ declaredExpiryDate?: string, foodName?: string }} [context]
 * @returns {Promise<{foodType: string, freshness: string, confidence: number, predictedExpiry: string}>}
 */
export function analyzeFoodImage(imageFile, context = {}) {
  return delay(1600).then(() => {
    // Mock AI response — replace with a real call to POST /api/ai/analyze-food
    // (send the image as multipart/form-data) once the AI service is ready.
    const freshness =
      FRESHNESS_LEVELS[Math.floor(Math.random() * (FRESHNESS_LEVELS.length - 1))]; // bias away from "Expired" for demo purposes
    const confidence = Math.floor(80 + Math.random() * 19);

    return {
      foodType: context.foodName || "Detected Food Item",
      freshness,
      confidence,
      predictedExpiry: context.declaredExpiryDate || todayISO(),
    };
  });
}

/**
 * Simulates POST /api/donations
 * @param {object} payload - form fields + image + aiAnalysis
 * @returns {Promise<object>} the created donation record
 */
export function createDonation(payload) {
  return delay().then(() => {
    const newDonation = {
      id: generateDonationId(),
      foodName: payload.foodName,
      category: payload.category,
      quantity: payload.quantity,
      unit: payload.unit,
      image: payload.imagePreviewUrl || payload.image || "",
      description: payload.description || "",
      preparationDate: payload.preparationDate,
      expiryDate: payload.expiryDate,
      freshness: payload.aiAnalysis?.freshness || "Good",
      confidence: payload.aiAnalysis?.confidence ?? null,
      predictedExpiry: payload.aiAnalysis?.predictedExpiry || payload.expiryDate,
      status: "AVAILABLE",
      location: payload.location,
      ngo: null,
      pickup: null,
      createdAt: todayISO(),
    };

    donationsStore = [newDonation, ...donationsStore];
    return newDonation;
  });
}

/**
 * Simulates GET /api/donations
 * @returns {Promise<object[]>}
 */
export function getMyDonations() {
  return delay().then(() => [...donationsStore]);
}

/**
 * Simulates GET /api/donations/:id
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export function getDonationById(id) {
  return delay().then(() => donationsStore.find((d) => d.id === id) || null);
}

/**
 * Simulates PATCH /api/donations/:id/cancel
 * @param {string} id
 * @returns {Promise<object>}
 */
export function cancelDonation(id) {
  return delay().then(() => {
    donationsStore = donationsStore.map((d) =>
      d.id === id ? { ...d, status: "CANCELLED" } : d
    );
    return donationsStore.find((d) => d.id === id);
  });
}

export default {
  analyzeFoodImage,
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
};
