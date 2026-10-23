const mongoose = require("mongoose");

// Permanent record of every password an email address has ever used, kept as
// bcrypt HASHES ONLY (never plaintext). It is used for exactly one thing:
// refusing a password that was used before for the same email.
//
//  - It must SURVIVE account deletion (never delete these records when a
//    User is removed), so a deleted-then-re-registered email cannot reuse an
//    old password.
//  - It is NEVER a login credential: login only checks User.password.
const passwordHistorySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports =
  mongoose.models.PasswordHistory ||
  mongoose.model("PasswordHistory", passwordHistorySchema);