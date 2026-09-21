import api from "./api";

/**
 * POST /api/auth/register
 * @returns {Promise<{token: string, user: object}>}
 */
export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

/**
 * POST /api/auth/login
 * @returns {Promise<{token: string, user: object}>}
 */
export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

/**
 * GET /api/auth/me — restores the authenticated user from the stored
 * token. Throws (caller should treat as "no valid session") if the
 * token is missing/expired/invalid.
 * @returns {Promise<{user: object}>}
 */
export async function fetchCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

/**
 * PATCH /api/auth/profile
 * @returns {Promise<{user: object}>}
 */
export async function updateProfile(payload) {
  const response = await api.patch("/auth/profile", payload);
  return response.data;
}

/**
 * POST /api/auth/forgot-password
 * Always resolves with the same generic message, whether or not the
 * email belongs to an account — never throws to reveal existence.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

/**
 * POST /api/auth/reset-password/:token
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetPassword(token, password) {
  const response = await api.post(`/auth/reset-password/${token}`, {
    password,
  });
  return response.data;
}

export default {
  registerUser,
  loginUser,
  fetchCurrentUser,
  forgotPassword,
  resetPassword,
};
