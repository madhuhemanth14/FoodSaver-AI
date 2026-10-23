const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ["donor", "ngo", "admin"],
      default: "donor",
    },

    // Real admin block/unblock (see adminController.updateUserStatus).
    // A blocked user must not be able to authenticate — enforced in
    // authController.login.
    isBlocked: {
      type: Boolean,
      default: false,
    },

    address: {
      type: String,
    },

    // Legacy password-reset link fields retained for compatibility. The
    // active UI uses the OTP fields below.
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // OTP-based password reset flow. The OTP itself is never stored in
    // plain text; only its SHA-256 hash and expiry are persisted.
    passwordResetOtpHash: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);