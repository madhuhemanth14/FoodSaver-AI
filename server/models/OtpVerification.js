const mongoose = require("mongoose");

// One document per (purpose, email). Issuing a new OTP overwrites the same
// document, which is what invalidates the previous OTP.
//
//   purpose "register" -> email-ownership OTP; after the backend verifies it,
//                         the hash of a short-lived "email verified" token.
//   purpose "reset"    -> password-reset OTP; after the backend verifies it,
//                         the hash of the short-lived reset token.
//
// Plain OTPs / reset tokens are never stored — only keyed HMAC hashes.
const otpVerificationSchema = new mongoose.Schema(
  {
    purpose: { type: String, enum: ["register", "reset"], required: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    otpHash: { type: String },          // cleared once used / invalidated
    otpExpiresAt: { type: Date },
    attempts: { type: Number, default: 0 },

    // Registration OTP lockout after too many incorrect attempts.
    lockedUntil: { type: Date },

    // Send throttling (per email + purpose)
    lastSentAt: { type: Date },
    windowStartedAt: { type: Date },
    sendCount: { type: Number, default: 0 },

    // Proof issued by the backend AFTER it verified the OTP. Purpose "reset":
    // authorizes one password change. Purpose "register": proves this email
    // was verified and authorizes creating one account. Stored hashed only.
    proofTokenHash: { type: String },
    proofTokenExpiresAt: { type: Date },

    // MongoDB removes the document automatically after this time.
    purgeAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpVerificationSchema.index({ purpose: 1, email: 1 }, { unique: true });
otpVerificationSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
otpVerificationSchema.index({ proofTokenHash: 1 }, { sparse: true });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
