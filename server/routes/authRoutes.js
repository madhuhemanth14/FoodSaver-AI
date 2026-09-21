const express = require("express");
const {
  register,
  login,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me — restores a session from a Bearer token; used on app
// load so the frontend never has to trust a locally-cached role/name.
router.get("/me", requireAuth, me);

// PATCH /api/auth/profile — real, backend-validated profile editing
// (name/phone/address). Email and role are not editable here.
router.patch("/profile", requireAuth, updateProfile);

// POST /api/auth/forgot-password — always responds with the same generic
// message regardless of whether the email exists.
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:token — consumes a single-use reset
// token (hashed match + expiry check) and sets a new password.
router.post("/reset-password/:token", resetPassword);

module.exports = router;
