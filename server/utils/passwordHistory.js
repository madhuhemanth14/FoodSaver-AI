const bcrypt = require("bcryptjs");
const PasswordHistory = require("../models/PasswordHistory");
const User = require("../models/User");

// The ONLY response for a reused password — same shape everywhere
// (registration and reset), so the frontend can rely on `code`.
const PASSWORD_REUSED_MESSAGE =
  "You have used this password before. Please use another password.";
const PASSWORD_REUSED_BODY = Object.freeze({
  success: false,
  code: "PASSWORD_REUSED",
  message: PASSWORD_REUSED_MESSAGE,
});

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

/**
 * Saves a bcrypt hash to the email's password history. Only hashes are ever
 * stored. An identical hash is not stored twice.
 */
async function savePasswordToHistory(email, passwordHash) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !passwordHash) return null;

  const existing = await PasswordHistory.findOne({ email: normalizedEmail, passwordHash });
  if (existing) return existing;

  return PasswordHistory.create({ email: normalizedEmail, passwordHash });
}

/**
 * Makes sure a user's CURRENT password hash is represented in history. This
 * is what protects legacy accounts created before password history existed:
 * call it before the password is replaced and before the account is deleted.
 */
async function ensureCurrentPasswordInHistory(user) {
  if (!user || !user.password) return null;
  return savePasswordToHistory(user.email, user.password);
}

/**
 * True if `newPassword` matches ANY password this email has used before.
 * Compares with bcrypt against the stored hashes; the plaintext is never
 * stored or logged. The user's current hash is included too, so an account
 * whose current password was never written to history (legacy) is still
 * covered.
 */
async function isPreviouslyUsedPassword(email, newPassword) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || newPassword === undefined || newPassword === null) return false;

  const records = await PasswordHistory.find({ email: normalizedEmail }).select("passwordHash");
  const hashes = new Set(records.map((r) => r.passwordHash));

  const currentUser = await User.findOne({ email: normalizedEmail }).select("password");
  if (currentUser && currentUser.password) hashes.add(currentUser.password);

  for (const hash of hashes) {
    if (await bcrypt.compare(String(newPassword), hash)) return true;
  }
  return false;
}

module.exports = {
  PASSWORD_REUSED_MESSAGE,
  PASSWORD_REUSED_BODY,
  isPreviouslyUsedPassword,
  savePasswordToHistory,
  ensureCurrentPasswordInHistory,
};
