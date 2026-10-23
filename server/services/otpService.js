const crypto = require("crypto");
const dns = require("dns").promises;
const OtpVerification = require("../models/OtpVerification");

const OTP_TTL_MS = 5 * 60 * 1000;           // OTP valid for 5 minutes
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;  // reset authorization valid for 10 minutes
const REGISTRATION_PROOF_TTL_MS = 30 * 60 * 1000; // time allowed to finish the form after verifying the email
const RESEND_COOLDOWN_MS = 60 * 1000;       // min gap between two OTP emails
const SEND_WINDOW_MS = 60 * 60 * 1000;      // rolling window for the send cap
const MAX_SENDS_PER_WINDOW = 5;             // OTP emails per email/purpose/hour
const MAX_ATTEMPTS = 3;                     // 3 wrong guesses lock email verification
const OTP_LOCK_MS = 2 * 60 * 60 * 1000;       // 2-hour registration verification lock

const HMAC_KEY = process.env.OTP_HMAC_SECRET || process.env.JWT_SECRET;
if (!HMAC_KEY) {
  throw new Error("JWT_SECRET (or OTP_HMAC_SECRET) is not set. Refusing to start without an OTP hashing key.");
}

// Keyed hash: a leaked database alone is not enough to brute-force the
// 6-digit space offline.
function hmac(value) {
  return crypto.createHmac("sha256", HMAC_KEY).update(value).digest("hex");
}

function hashOtp(purpose, email, otp) {
  return hmac(`otp:${purpose}:${email}:${otp}`);
}

function hashResetToken(token) {
  return hmac(`reset-token:${token}`);
}

function safeEqualHex(a, b) {
  const ba = Buffer.from(String(a || ""), "hex");
  const bb = Buffer.from(String(b || ""), "hex");
  return ba.length > 0 && ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)); // CSPRNG, always 6 digits
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Domain-level deliverability check only (does the domain publish mail
// servers?). This says nothing about the individual mailbox and never looks
// at Google/Gmail login state — mailbox ownership is proven by the OTP.
async function domainCanReceiveMail(email) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) return true;
  } catch (err) {
    if (err.code !== "ENODATA" && err.code !== "ENOTFOUND") {
      // DNS itself is failing (timeout, refused...). Don't reject real users
      // because of our own resolver — the OTP step still protects us.
      return true;
    }
  }
  try {
    const a = await dns.resolve4(domain);
    return a.length > 0; // RFC 5321 implicit-MX fallback
  } catch (err) {
    if (err.code === "ENODATA" || err.code === "ENOTFOUND") return false;
    return true;
  }
}

/**
 * Applies the resend cooldown + hourly cap, then writes a fresh OTP over any
 * previous one. Returns { ok:false, status, message, retryAfterSeconds } when
 * throttled, otherwise { ok:true, otp, doc }. The caller emails the OTP and
 * must call discardOtp() if the email could not be sent.
 */
async function issueOtp({ purpose, email }) {
  const now = new Date();
  const existing = await OtpVerification.findOne({ purpose, email });

  // A registration email locked after 3 incorrect OTP attempts cannot
  // request another OTP until the 2-hour lock expires.
  if (purpose === "register" && existing?.lockedUntil) {
    const remainingMs = existing.lockedUntil.getTime() - now.getTime();
    if (remainingMs > 0) {
      return {
        ok: false,
        status: 429,
        code: "OTP_LOCKED",
        retryAfterSeconds: Math.ceil(remainingMs / 1000),
        message: "Email verification is temporarily locked after too many incorrect OTP attempts. Please try again later.",
      };
    }
  }

  let sendCount = 0;
  let windowStartedAt = now;

  if (existing) {
    if (existing.lastSentAt) {
      const waitMs = existing.lastSentAt.getTime() + RESEND_COOLDOWN_MS - now.getTime();
      if (waitMs > 0) {
        const retryAfterSeconds = Math.ceil(waitMs / 1000);
        return {
          ok: false,
          status: 429,
          retryAfterSeconds,
          message: `Please wait ${retryAfterSeconds} seconds before requesting another OTP.`,
        };
      }
    }
    if (existing.windowStartedAt && now - existing.windowStartedAt < SEND_WINDOW_MS) {
      windowStartedAt = existing.windowStartedAt;
      sendCount = existing.sendCount || 0;
      if (sendCount >= MAX_SENDS_PER_WINDOW) {
        const retryAfterSeconds = Math.ceil(
          (existing.windowStartedAt.getTime() + SEND_WINDOW_MS - now.getTime()) / 1000
        );
        return {
          ok: false,
          status: 429,
          retryAfterSeconds,
          message: "Too many OTP requests. Please try again later.",
        };
      }
    }
  }

  // Snapshot of the state before this request, so a failed email send can put
  // it back (see rollbackOtp) instead of destroying an OTP that still works.
  const previous = existing ? snapshotOtpState(existing) : null;

  const otp = generateOtp();
  const update = {
    otpHash: hashOtp(purpose, email, otp),
    otpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: undefined,
    lastSentAt: now,
    windowStartedAt,
    sendCount: sendCount + 1,
    // Keep the doc long enough for the send counters AND for a reset token
    // issued right before the OTP expires.
    purgeAt: new Date(
      Math.max(
        windowStartedAt.getTime() + SEND_WINDOW_MS,
        now.getTime() + OTP_TTL_MS + RESET_TOKEN_TTL_MS
      )
    ),
    // A new OTP invalidates any earlier verification/reset proof too.
    proofTokenHash: undefined,
    proofTokenExpiresAt: undefined,
  };

  const doc = await OtpVerification.findOneAndUpdate(
    { purpose, email },
    {
      $set: Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined)),
      $unset: { proofTokenHash: "", proofTokenExpiresAt: "", lockedUntil: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { ok: true, otp, doc, previous };
}

// Called when the OTP email could not be sent: nothing is left to guess.
async function discardOtp(purpose, email) {
  await OtpVerification.deleteOne({ purpose, email });
}

const SNAPSHOT_FIELDS = [
  "otpHash",
  "otpExpiresAt",
  "attempts",
  "lockedUntil",
  "lastSentAt",
  "windowStartedAt",
  "sendCount",
  "purgeAt",
  "proofTokenHash",
  "proofTokenExpiresAt",
];

function snapshotOtpState(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  const snap = {};
  for (const f of SNAPSHOT_FIELDS) snap[f] = plain[f];
  return snap;
}

/**
 * The new OTP could not be emailed, so it must not replace the old one.
 * First send (nothing existed before) -> delete the record: nothing to guess.
 * Resend -> restore the exact previous state, so the OTP the user already
 * received keeps working under its normal expiry / attempt rules, and the
 * failed attempt does not count against the resend cooldown or hourly cap.
 */
async function rollbackOtp(purpose, email, previous) {
  if (!previous) {
    await OtpVerification.deleteOne({ purpose, email });
    return;
  }
  const $set = {};
  const $unset = {};
  for (const f of SNAPSHOT_FIELDS) {
    if (previous[f] === undefined || previous[f] === null) $unset[f] = "";
    else $set[f] = previous[f];
  }
  const ops = {};
  if (Object.keys($set).length) ops.$set = $set;
  if (Object.keys($unset).length) ops.$unset = $unset;
  await OtpVerification.updateOne({ purpose, email }, ops);
}

/**
 * Checks a submitted OTP. On success the OTP is consumed atomically
 * (single use). Returns { ok:true, doc } or { ok:false, status, code, message }.
 */
async function checkOtp({ purpose, email, otp }) {
  const doc = await OtpVerification.findOne({ purpose, email });

  if (!doc || !doc.otpHash) {
    return {
      ok: false,
      status: 400,
      code: "OTP_USED",
      message: "This OTP is no longer valid or has already been used. Please request a new OTP.",
    };
  }

  if (!doc.otpExpiresAt || doc.otpExpiresAt <= new Date()) {
    await OtpVerification.updateOne({ _id: doc._id }, { $unset: { otpHash: "", otpExpiresAt: "" } });
    return {
      ok: false,
      status: 400,
      code: "OTP_EXPIRED",
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  if (doc.lockedUntil && doc.lockedUntil > new Date()) {
    return {
      ok: false,
      status: 429,
      code: "OTP_LOCKED",
      retryAfterSeconds: Math.ceil((doc.lockedUntil.getTime() - Date.now()) / 1000),
      message: "Email verification is temporarily locked after too many incorrect OTP attempts. Please try again later.",
    };
  }

  if ((doc.attempts || 0) >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + OTP_LOCK_MS);
    await OtpVerification.updateOne(
      { _id: doc._id },
      { $set: { lockedUntil }, $unset: { otpHash: "", otpExpiresAt: "" } }
    );
    return {
      ok: false,
      status: 429,
      code: "OTP_LOCKED",
      retryAfterSeconds: Math.ceil(OTP_LOCK_MS / 1000),
      message: "Email verification is temporarily locked after too many incorrect OTP attempts. Please try again later.",
    };
  }

  if (!safeEqualHex(doc.otpHash, hashOtp(purpose, email, otp))) {
    const updated = await OtpVerification.findOneAndUpdate(
      { _id: doc._id, otpHash: doc.otpHash },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (updated && updated.attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + OTP_LOCK_MS);
      await OtpVerification.updateOne(
        { _id: doc._id },
        { $set: { lockedUntil }, $unset: { otpHash: "", otpExpiresAt: "" } }
      );
      return {
        ok: false,
        status: 429,
        code: "OTP_LOCKED",
        retryAfterSeconds: Math.ceil(OTP_LOCK_MS / 1000),
        message: "Email verification is temporarily locked after too many incorrect OTP attempts. Please try again later.",
      };
    }
    return { ok: false, status: 400, code: "OTP_INVALID", message: "Invalid OTP. Please try again." };
  }

  // Consume atomically: of two concurrent correct submissions only one wins.
  const consumed = await OtpVerification.findOneAndUpdate(
    { _id: doc._id, otpHash: doc.otpHash },
    { $unset: { otpHash: "", otpExpiresAt: "" }, $set: { attempts: 0 } },
    { new: true }
  );
  if (!consumed) {
    return {
      ok: false,
      status: 400,
      code: "OTP_USED",
      message: "This OTP is no longer valid or has already been used. Please request a new OTP.",
    };
  }
  return { ok: true, doc: consumed };
}

/**
 * After checkOtp() succeeded: mint a random proof token, store only its hash
 * and return the raw token (sent to the client once, never stored).
 */
async function issueProofToken(doc, ttlMs) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);
  await OtpVerification.updateOne(
    { _id: doc._id },
    {
      $set: {
        proofTokenHash: hashResetToken(token),
        proofTokenExpiresAt: expiresAt,
        purgeAt: new Date(Math.max(doc.purgeAt?.getTime() || 0, expiresAt.getTime())),
      },
    }
  );
  return token;
}

/** Finds a live (unexpired) proof session for purpose + raw token [+ email]. */
async function findProofSession({ purpose, rawToken, email }) {
  if (!rawToken || typeof rawToken !== "string") return null;
  const query = {
    purpose,
    proofTokenHash: hashResetToken(rawToken),
    proofTokenExpiresAt: { $gt: new Date() },
  };
  if (email) query.email = email;
  return OtpVerification.findOne(query);
}

module.exports = {
  issueProofToken,
  findProofSession,
  OTP_TTL_MS,
  RESET_TOKEN_TTL_MS,
  REGISTRATION_PROOF_TTL_MS,
  OTP_LOCK_MS,
  RESEND_COOLDOWN_MS,
  EMAIL_REGEX,
  normalizeEmail,
  domainCanReceiveMail,
  issueOtp,
  discardOtp,
  rollbackOtp,
  checkOtp,
  hashResetToken,
};
