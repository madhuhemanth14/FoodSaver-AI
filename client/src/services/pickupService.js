import axios from "axios";

const API_URL = "http://localhost:5000/api/pickups";

/**
 * Create pickup
 */
export const createPickup = async (pickupData) => {
  const response = await axios.post(API_URL, pickupData);
  return response.data.data;
};

/**
 * Get all pickups
 */
export const getMyPickups = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

/**
 * Get one pickup
 */
export const getPickup = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

/**
 * Update pickup status
 */
export const updatePickupStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}`, {
    status,
  });

  return response.data.data;
};

/**
 * Cancel pickup
 */
export const cancelPickup = async (id) => {
  const response = await axios.put(`${API_URL}/${id}`, {
    status: "Cancelled",
  });

  return response.data.data;
};