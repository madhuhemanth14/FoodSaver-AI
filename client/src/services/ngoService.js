import { mockNGOs } from "../data/mockNGOs.js";

/**
 * Get all NGOs
 */
export const getNGOs = async () => {
  return [...mockNGOs];
};

/**
 * Get nearby NGOs
 */
export const getNearbyNGOs = async (
  latitude = 17.385,
  longitude = 78.4867,
  radius = 10
) => {
  // Mock implementation for frontend development.
  // Later this will call:
  // GET /api/ngos/nearby?lat=...&lng=...

  return mockNGOs.filter((ngo) => ngo.distance <= radius);
};

/**
 * Get NGO by ID
 */
export const getNGOById = async (id) => {
  return mockNGOs.find((ngo) => String(ngo.id) === String(id)) || null;
};

/**
 * Search NGOs
 */
export const searchNGOs = async (searchTerm = "") => {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    return [...mockNGOs];
  }

  return mockNGOs.filter((ngo) => {
    return (
      ngo.name.toLowerCase().includes(term) ||
      ngo.address.toLowerCase().includes(term) ||
      ngo.acceptedFood.some((food) =>
        food.toLowerCase().includes(term)
      )
    );
  });
};