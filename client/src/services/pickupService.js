import { api } from '../context/AuthContext';

/**
 * Create pickup
 */
export const createPickup = async (pickupData) => {
  const response = await api.post('/pickups', pickupData);
  return response.data.data;
};

/**
 * Get all pickups
 */
export const getMyPickups = async () => {
  const response = await api.get('/pickups');
  return response.data.data;
};

/**
 * Get one pickup
 */
export const getPickup = async (id) => {
  const response = await api.get(`/pickups/${id}`);
  return response.data.data;
};

/**
 * Update pickup status
 */
export const updatePickupStatus = async (id, status) => {
  const response = await api.put(`/pickups/${id}`, {
    status,
  });

  return response.data.data;
};

/**
 * Cancel pickup
 */
export const cancelPickup = async (id) => {
  const response = await api.put(`/pickups/${id}`, {
    status: "Cancelled",
  });

  return response.data.data;
};