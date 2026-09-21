import api from "./api";

const RESOURCE = "/ngos";

export const getNGOs = async () => {
  const response = await api.get(RESOURCE);
  return response.data.data;
};

export const getNGOById = async (id) => {
  const response = await api.get(`${RESOURCE}/${id}`);
  return response.data.data;
};

export const searchNGOs = async (searchTerm = "") => {
  const response = await api.get(RESOURCE);

  const ngos = response.data.data;

  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    return ngos;
  }

  return ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(term) ||
    ngo.address.toLowerCase().includes(term) ||
    ngo.acceptedFood.some((food) =>
      food.toLowerCase().includes(term)
    )
  );
};

/** GET /api/ngos/me — the authenticated NGO user's own organization record. */
export const getMyNGO = async () => {
  const response = await api.get(`${RESOURCE}/me`);
  return response.data.data;
};

/** PATCH /api/ngos/me — real NGO profile editing. */
export const updateMyNGO = async (payload) => {
  const response = await api.patch(`${RESOURCE}/me`, payload);
  return response.data.data;
};

/** GET /api/ngos/dashboard — real per-NGO operational overview. */
export const getNgoDashboard = async () => {
  const response = await api.get(`${RESOURCE}/dashboard`);
  return response.data;
};
