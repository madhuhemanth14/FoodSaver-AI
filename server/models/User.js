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

    // Password reset — populated by POST /api/auth/forgot-password,
    // consumed by POST /api/auth/reset-password/:token. Only ever a
    // SHA-256 hash of the token is stored here; the raw token exists
    // only in the emailed link and is never persisted or logged.
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);