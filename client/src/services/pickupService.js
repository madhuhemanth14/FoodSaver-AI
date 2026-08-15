// Pickup service layer.
//
// Backed by mock data for now. Every function is async and returns plain
// objects/arrays so this can later be pointed at Express + MongoDB without
// touching the components that call it.
//
// Example future implementation:
//   export const createPickup = (data) =>
//     api.post("/pickups", data).then((res) => res.data);

import { mockPickups, PICKUP_STATUS } from "../data/mockPickups";

const SIMULATED_DELAY_MS = 400;

const delay = (value, ms = SIMULATED_DELAY_MS) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// In-memory store so created/updated/cancelled pickups persist for the
// remainder of the session (mirrors how a real API's DB state behaves).
let pickups = [...mockPickups];
let nextIdNumber = 1025;

/** Create a new pickup request. Returns the created pickup. */
export async function createPickup(pickupData) {
  const newPickup = {
    id: `FS${nextIdNumber++}`,
    donationId: pickupData.donationId || `DON-${Math.floor(1000 + Math.random() * 9000)}`,
    status: PICKUP_STATUS.REQUESTED,
    createdAt: new Date().toISOString(),
    ...pickupData,
  };

  pickups = [newPickup, ...pickups];
  return delay(newPickup);
}

/** Get a single pickup by id. Returns null if not found. */
export async function getPickup(id) {
  const pickup = pickups.find((p) => p.id === id) || null;
  return delay(pickup);
}

/** Get all pickups for the current donor, newest first. */
export async function getMyPickups() {
  const sorted = [...pickups].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return delay(sorted);
}

/** Update the status of a pickup. Returns the updated pickup, or null. */
export async function updatePickupStatus(id, status) {
  let updated = null;
  pickups = pickups.map((p) => {
    if (p.id === id) {
      updated = { ...p, status };
      return updated;
    }
    return p;
  });
  return delay(updated);
}

/** Cancel a pickup (marks it REJECTED, matching the status enum). */
export async function cancelPickup(id) {
  return updatePickupStatus(id, PICKUP_STATUS.REJECTED);
}
