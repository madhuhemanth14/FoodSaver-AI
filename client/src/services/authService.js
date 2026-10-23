import api from "./api";

/**
 * POST /api/auth/register/send-otp — the "Verify Email" button (and "Resend
 * OTP"). Emails a verification OTP; nothing else is created.
 * @returns {Promise<{success: boolean, message: string, expiresInSeconds: number, resendAvailableInSeconds: number}>}
 */
export async function sendRegistrationOtp(email) {
  const response = await api.post("/auth/register/send-otp", { email });
  return response.data;
}


/**
 * POST /api/auth/register/verify-otp — the backend checks the OTP and, only
 * if it is correct, returns the verificationToken that Create Account needs.
 * @returns {Promise<{success: boolean, verificationToken: string}>}
 */
export async function verifyRegistrationOtp(email, otp) {
  const response = await api.post("/auth/register/verify-otp", { email, otp });
  return response.data;
}

/**
 * POST /api/auth/register — "Create Account". The backend refuses unless the
 * payload carries a valid verificationToken for the same email.
 * @returns {Promise<{success: boolean, user: object}>}
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
 * Checks the account email and sends a six-digit OTP.
 */
export async function deleteAccount() {
  const response = await api.delete("/auth/account");
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

/**
 * POST /api/auth/verify-reset-otp
 * Verifies the OTP and returns a short-lived token for password creation.
 */
export async function verifyResetOtp(email, otp) {
  const response = await api.post("/auth/verify-reset-otp", { email, otp });
  return response.data;
}

/**
 * POST /api/auth/reset-password-with-otp
 */
export async function resetPasswordWithOtp(email, otp, password) {
  const response = await api.post("/auth/reset-password-with-otp", {
    email,
    otp,
    password,
  });
  return response.data;
}

/**
 * POST /api/auth/validate-reset-token
 * Asks the backend whether this reset token is real and unexpired. The reset
 * page uses it before showing the "Create New Password" form.
 */
export async function validateResetToken(resetToken) {
  const response = await api.post("/auth/validate-reset-token", { resetToken });
  return response.data;
}

/**
 * POST /api/auth/reset-password
 * Needs the token issued by verifyResetOtp — the backend rejects anything else.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetPassword(resetToken, password) {
  const response = await api.post("/auth/reset-password", {
    resetToken,
    password,
  });
  return response.data;
}

export default {
  registerUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  validateResetToken,
  loginUser,
  fetchCurrentUser,
  forgotPassword,
  resetPassword,
  resetPasswordWithOtp,
  verifyResetOtp,
  deleteAccount,
};
