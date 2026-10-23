import axios from "axios";

// Single axios instance for every backend call. Attaches the stored JWT
// (if any) to every request so the backend can identify + authorize the
// caller — this is what lets requireAuth/requireRole trust req.user
// instead of anything the frontend claims.
export const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
