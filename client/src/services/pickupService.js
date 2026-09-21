import api from "./api";

const RESOURCE = "/pickups";

/**
 * Create pickup. Donor identity is derived server-side from the
 * authenticated user (see server/controllers/pickupController.js) — this
 * payload only carries what the server can't infer: which donation (if
 * any), which NGO, and pickup logistics.
 */
export const createPickup = async (pickupData) => {
  const response = await api.post(RESOURCE, pickupData);
  return response.data.data;
};

/**
 * Get pickups visible to the authenticated user (their own, if a donor).
 */
export const getMyPickups = async () => {
  const response = await api.get(RESOURCE);
  return response.data.data;
};

/**
 * Get one pickup
 */
export const getPickup = async (id) => {
  const response = await api.get(`${RESOURCE}/${id}`);
  return response.data.data;
};

/**
 * Update pickup status (NGO/admin only — enforced server-side)
 */
export const updatePickupStatus = async (id, status) => {
  const response = await api.put(`${RESOURCE}/${id}`, { status });
  return response.data.data;
};

/**
 * Cancel pickup (NGO/admin only — enforced server-side)
 */
export const cancelPickup = async (id) => {
  const response = await api.put(`${RESOURCE}/${id}`, { status: "Cancelled" });
  return response.data.data;
};
