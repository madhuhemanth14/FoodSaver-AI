const express = require("express");
const {
  register,
  sendRegistrationOtp,
  verifyRegistrationEmail,
  verifyRegistrationOtp,
  login,
  me,
  updateProfile,
  forgotPassword,
  verifyResetOtp,
  validateResetToken,
  resetPassword,
  resetPasswordWithOtp,
  deleteAccount,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

// Per-IP ceiling on every OTP-related endpoint. The per-email cooldown and
// hourly cap live in services/otpService.js (MongoDB-backed).
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.OTP_IP_RATE_LIMIT_MAX) || 30,
  message: "Too many requests. Please try again in a few minutes.",
});

// --- Registration. The email is verified first; POST /register refuses to
// create an account without the verificationToken that verify-otp issues.
router.post("/register/send-otp", otpLimiter, sendRegistrationOtp); // "Resend OTP" (unchanged)
router.post("/register/verify-email", otpLimiter, verifyRegistrationEmail);
router.post("/register/verify-otp", otpLimiter, verifyRegistrationOtp);
router.post("/register", otpLimiter, register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me — restores a session from a Bearer token; used on app
// load so the frontend never has to trust a locally-cached role/name.
router.get("/me", requireAuth, me);

// PATCH /api/auth/profile — real, backend-validated profile editing
// (name/phone/address). Email and role are not editable here.
router.patch("/profile", requireAuth, updateProfile);
router.delete("/account", requireAuth, deleteAccount);

// --- Forgot password (OTP). Also used by "Resend OTP".
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-reset-otp", otpLimiter, verifyResetOtp);
router.post("/validate-reset-token", otpLimiter, validateResetToken);

// POST /api/auth/reset-password — needs the reset token that only
// verify-reset-otp can issue. The :token form is kept for compatibility.
router.post("/reset-password", otpLimiter, resetPassword);
router.post("/reset-password/:token", otpLimiter, resetPassword);
router.post("/reset-password-with-otp", resetPasswordWithOtp);

module.exports = router;
