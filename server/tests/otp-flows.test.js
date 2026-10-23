// Integration tests for email-verified registration + OTP forgot-password.
//
//   MONGO_URI=mongodb://127.0.0.1:27017/foodsaver-test node --test tests/
//
// Uses the REAL routes, controllers, models and MongoDB. Only two things are
// stubbed, because tests must not send real email or depend on live DNS:
//   * nodemailer's transporter (captures outgoing mail; rejects "bad" recipients)
//   * DNS MX lookups (kept only to prove registration no longer depends on DNS)
//   * services/emailMailboxCheck (the "Verify" click's mailbox check; the real one
//     is covered against a fake MX server in tests/mailbox-check.test.js)
// WARNING: this test DROPS the database named in MONGO_URI. Use a scratch DB.

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/foodsaver-test";
if (!/test/i.test(MONGO_URI)) {
  throw new Error("Refusing to run: MONGO_URI database name must contain 'test' (this test drops it).");
}
process.env.OTP_IP_RATE_LIMIT_MAX = "100000"; // per-IP limiter is tested separately below
process.env.EMAIL_USER = "noreply@foodsaver.test";
process.env.EMAIL_PASS = "x";
process.env.RECIPIENT_PROBE = "off"; // MX probing is covered in tests/recipient-probe.test.js

const test = require("node:test");
const assert = require("node:assert/strict");

// ---- stubs (must be installed before the app modules are required)
const nodemailer = require("nodemailer");
const outbox = [];
let failNextSend = false; // makes exactly one send fail like a broken SMTP login
nodemailer.createTransport = () => ({
  async sendMail(opts) {
    if (failNextSend) {
      failNextSend = false;
      const err = new Error("Invalid login: 535-5.7.8 Username and Password not accepted");
      err.code = "EAUTH";
      err.responseCode = 535;
      err.command = "AUTH PLAIN";
      throw err;
    }
    if (/nonexistent|bounce|no-such-domain/.test(opts.to)) {
      // What nodemailer throws when the server refuses the recipient at RCPT TO.
      const err = new Error("Can't send mail - all recipients were rejected: 550 5.1.1 The email account that you tried to reach does not exist");
      err.code = "EENVELOPE";
      err.command = "RCPT TO";
      err.responseCode = 550;
      err.rejected = [opts.to];
      throw err;
    }
    if (/smtpauthfail/.test(opts.to)) {
      // Our own Gmail login is broken: the recipient is not at fault.
      const err = new Error("Invalid login: 535-5.7.8 Username and Password not accepted");
      err.code = "EAUTH";
      err.responseCode = 535;
      err.command = "AUTH PLAIN";
      throw err;
    }
    outbox.push(opts);
    return { accepted: [opts.to], rejected: [] };
  },
});
const dns = require("dns");
const realResolveMx = dns.promises.resolveMx;
dns.promises.resolveMx = async (domain) => {
  if (domain === "no-such-domain.invalid") {
    const err = new Error("queryMx ENOTFOUND");
    err.code = "ENOTFOUND";
    throw err;
  }
  return [{ exchange: "mx.stub", priority: 1 }];
};
dns.promises.resolve4 = async () => {
  const err = new Error("ENOTFOUND");
  err.code = "ENOTFOUND";
  throw err;
};

// "Verify" click mailbox check: safe unless the address says otherwise.
//   *@no-such-domain.invalid -> not_safe (domain cannot receive mail)
//   missing-mailbox@*        -> not_safe (recipient MX said 550 5.1.1)
//   inconclusive@*           -> unknown  (greylist / blocked port 25 / DNS trouble)
const mailboxService = require("../services/emailMailboxCheck");
mailboxService.checkMailbox = async (email) => {
  if (/@no-such-domain\.invalid$/.test(email)) return { status: "not_safe", reason: "domain_cannot_receive_mail", detail: "stub" };
  if (/^missing-mailbox@/.test(email)) return { status: "not_safe", reason: "mailbox_rejected", detail: "stub" };
  if (/^inconclusive@|^dnsflaky@/.test(email)) return { status: "unknown", reason: "smtp_inconclusive", detail: "stub" };
  return { status: "safe", reason: "recipient_accepted", detail: "stub" };
};

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const authRoutes = require("../routes/authRoutes");

// Some Mongo-compatible servers (e.g. FerretDB) don't implement TTL indexes.
// Real MongoDB does. Set NO_TTL_INDEX=1 to skip ONLY that index in this test
// run; the "expired" cases below are enforced by explicit expiry checks in the
// code (otpExpiresAt / proofTokenExpiresAt), not by the TTL cleanup.
if (process.env.NO_TTL_INDEX) {
  OtpVerification.schema._indexes = OtpVerification.schema._indexes.filter(
    ([, opts]) => !("expireAfterSeconds" in opts)
  );
}

let server;
let base;

const post = async (path, body) => {
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = {};
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, body: json };
};

// Latest 6-digit code emailed to `to` (the tests read it from the stubbed inbox,
// exactly as a real user would read it from their mailbox).
const lastOtp = (to) => {
  const mail = [...outbox].reverse().find((m) => m.to === to);
  assert.ok(mail, `no email was sent to ${to}`);
  return mail.text.match(/\b(\d{6})\b/)[1];
};

// Skip the 60s resend cooldown without waiting.
const skipCooldown = (purpose, email) =>
  OtpVerification.updateOne({ purpose, email }, { $set: { lastSentAt: new Date(Date.now() - 61_000) } });

const reg = (over = {}) => ({
  name: "Sowmya",
  email: "sowmya@example.com",
  password: "secret123",
  phone: "9999999999",
  role: "Food Donor",
  ...over,
});

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();
  await User.init();
  await OtpVerification.init();
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}/api/auth`;
});

test.after(async () => {
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  dns.promises.resolveMx = realResolveMx;
});

// ------------------------------------------------------------------ REGISTRATION

const UNVERIFIED = "Email doesn't exist. Please enter a correct email address.";

// Runs "Verify Email" + "Verify OTP" and returns the verification token.
async function verifyEmail(email) {
  const s = await post("/register/send-otp", { email });
  assert.equal(s.status, 200, JSON.stringify(s.body));
  const v = await post("/register/verify-otp", { email, otp: lastOtp(email) });
  assert.equal(v.status, 200, JSON.stringify(v.body));
  return v.body.verificationToken;
}

test("registration: Verify Email sends an OTP but creates NO account and returns no OTP/token", async () => {
  const r = await post("/register/send-otp", { email: "sowmya@example.com" });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "OTP sent successfully");
  assert.ok(!JSON.stringify(r.body).match(/\b\d{6}\b/), "OTP must not appear in the API response");
  assert.equal(r.body.verificationToken, undefined);
  assert.equal(await User.countDocuments({ email: "sowmya@example.com" }), 0);

  const code = lastOtp("sowmya@example.com");
  const stored = await OtpVerification.findOne({ purpose: "register", email: "sowmya@example.com" });
  assert.notEqual(stored.otpHash, code, "OTP stored hashed");
  assert.equal(stored.otpHash.length, 64);
  assert.equal(stored.proofTokenHash, undefined, "not verified yet");
});

test("registration: Create Account is refused before the email is verified (no token / forged / other email)", async () => {
  const email = "sowmya@example.com"; // OTP was sent above but never verified
  const before = await User.countDocuments();
  assert.equal((await post("/register", reg())).status, 403);
  assert.equal((await post("/register", reg({ verificationToken: "f".repeat(64) }))).status, 403);
  assert.equal((await post("/register", reg({ verificationToken: lastOtp(email) }))).status, 403, "OTP is not a token");
  assert.equal(await User.countDocuments(), before);
});

test("registration: full happy path: verify email -> Email Verified -> Create Account -> login", async () => {
  const email = "sowmya@example.com";
  await skipCooldown("register", email);
  const s = await post("/register/send-otp", { email });
  assert.equal(s.status, 200);
  const v = await post("/register/verify-otp", { email, otp: lastOtp(email) });
  assert.equal(v.status, 200);
  assert.equal(v.body.message, "Email Verified");
  assert.ok(v.body.verificationToken);
  const st = await OtpVerification.findOne({ purpose: "register", email });
  assert.notEqual(st.proofTokenHash, v.body.verificationToken, "token stored hashed only");

  // a token for one email cannot create an account for another
  assert.equal((await post("/register", reg({ email: "other@example.com", verificationToken: v.body.verificationToken }))).status, 403);
  assert.equal(await User.countDocuments({ email: "other@example.com" }), 0);

  // short password rejected without burning the verification
  assert.equal((await post("/register", reg({ password: "123", verificationToken: v.body.verificationToken }))).status, 400);

  const c = await post("/register", reg({ verificationToken: v.body.verificationToken }));
  assert.equal(c.status, 201);
  assert.equal(await User.countDocuments({ email }), 1);
  const u = await User.findOne({ email });
  assert.ok(u.password.startsWith("$2"), "password bcrypt-hashed");

  const login = await post("/login", { email, password: "secret123", role: "donor" });
  assert.equal(login.status, 200);

  // verification is single-use
  assert.equal(await OtpVerification.countDocuments({ purpose: "register", email }), 0);
  assert.notEqual((await post("/register", reg({ verificationToken: v.body.verificationToken }))).status, 201);
});

test("registration: our own SMTP login failing is NOT reported as a bad email address", async () => {
  const email = "smtpauthfail@example.com";
  const r = await post("/register/send-otp", { email });
  assert.equal(r.status, 503);
  assert.equal(r.body.code, "EMAIL_SERVICE_ERROR");
  assert.notEqual(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email }), 0);
});

test("registration: undeliverable email (SMTP rejects) -> error, nothing stored, cannot create account", async () => {
  const email = "nonexistent.person@example.com";
  const r = await post("/register/send-otp", { email });
  assert.equal(r.status, 422);
  assert.equal(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email }), 0);
  assert.equal((await post("/register", reg({ email, verificationToken: "a".repeat(64) }))).status, 403);
  assert.equal(await User.countDocuments({ email }), 0);
});

test("registration: DNS is NOT used to judge the email — the email service decides", async () => {
  // A DNS failure for the domain must not block sending: the OTP email is
  // handed to the email service, which accepts it here.
  const ok = await post("/register/send-otp", { email: "someone@dns-is-irrelevant.example" });
  assert.equal(ok.status, 200);
  // ...and when the email service itself refuses the recipient, the user is told so.
  const r = await post("/register/send-otp", { email: "someone@no-such-domain.invalid" });
  assert.equal(r.status, 422);
  assert.equal(r.body.code, "EMAIL_UNVERIFIED");
  assert.equal(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email: "someone@no-such-domain.invalid" }), 0);
});

test("registration: user can change a bad email and click Verify Email again", async () => {
  await post("/register/send-otp", { email: "nonexistent.typo@example.com" });
  const r = await post("/register/send-otp", { email: "fixed@example.com" });
  assert.equal(r.status, 200);
  assert.ok(lastOtp("fixed@example.com"));
});

test("registration: incorrect OTP -> 'Invalid OTP', no token; 5 wrong tries lock the OTP", async () => {
  const email = "wrong@example.com";
  await post("/register/send-otp", { email });
  const good = lastOtp(email);
  const bad = good === "111111" ? "222222" : "111111";

  const r = await post("/register/verify-otp", { email, otp: bad });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Invalid OTP. Please try again.");
  assert.equal(r.body.verificationToken, undefined);

  for (let i = 0; i < 3; i++) await post("/register/verify-otp", { email, otp: bad });
  assert.equal((await post("/register/verify-otp", { email, otp: bad })).status, 429);
  const afterLock = await post("/register/verify-otp", { email, otp: good });
  assert.notEqual(afterLock.status, 200);
  assert.equal(afterLock.body.verificationToken, undefined);
});

test("registration: expired OTP is rejected", async () => {
  const email = "expired@example.com";
  await post("/register/send-otp", { email });
  const code = lastOtp(email);
  await OtpVerification.updateOne({ purpose: "register", email }, { $set: { otpExpiresAt: new Date(Date.now() - 1000) } });
  const r = await post("/register/verify-otp", { email, otp: code });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "OTP has expired. Please request a new OTP.");
  assert.equal(r.body.verificationToken, undefined);
});

test("registration: expired verification token cannot create an account", async () => {
  const email = "lateform@example.com";
  const token = await verifyEmail(email);
  await OtpVerification.updateOne({ purpose: "register", email }, { $set: { proofTokenExpiresAt: new Date(Date.now() - 1000) } });
  const c = await post("/register", reg({ email, verificationToken: token }));
  assert.equal(c.status, 403);
  assert.equal(await User.countDocuments({ email }), 0);
});

test("registration: Resend OTP has a cooldown, invalidates the old OTP, and old verification proof", async () => {
  const email = "resend@example.com";
  await post("/register/send-otp", { email });
  const first = lastOtp(email);

  const tooSoon = await post("/register/send-otp", { email });
  assert.equal(tooSoon.status, 429);
  assert.ok(tooSoon.body.retryAfterSeconds > 0);

  await skipCooldown("register", email);
  assert.equal((await post("/register/send-otp", { email })).status, 200);
  const second = lastOtp(email);
  if (second !== first) {
    assert.equal((await post("/register/verify-otp", { email, otp: first })).status, 400, "old OTP invalid after resend");
  }
  assert.equal((await post("/register/verify-otp", { email, otp: second })).status, 200);
});

test("registration: FAILED resend keeps the previous OTP valid, sends nothing new, and does not count against the cap", async () => {
  const email = "failresend@example.com";
  assert.equal((await post("/register/send-otp", { email })).status, 200);
  const first = lastOtp(email);
  const mailsBefore = outbox.filter((m) => m.to === email).length;
  await skipCooldown("register", email);
  const before = await OtpVerification.findOne({ purpose: "register", email });

  failNextSend = true;
  const failed = await post("/register/send-otp", { email });
  assert.equal(failed.status, 503);
  assert.equal(failed.body.success, false);
  assert.equal(failed.body.otp, undefined, "OTP must never be in a response");
  assert.equal(outbox.filter((m) => m.to === email).length, mailsBefore, "no new email was sent");

  const after = await OtpVerification.findOne({ purpose: "register", email });
  assert.ok(after, "the previous OTP record is kept");
  assert.equal(after.otpHash, before.otpHash, "previous OTP unchanged");
  assert.equal(after.sendCount, before.sendCount, "failed send is not counted");

  // The OTP the user already received still works under its normal rules.
  const v = await post("/register/verify-otp", { email, otp: first });
  assert.equal(v.status, 200, JSON.stringify(v.body));
});

test("registration: hourly send cap", async () => {
  const email = "cap@example.com";
  await post("/register/send-otp", { email });
  for (let i = 0; i < 4; i++) {
    await skipCooldown("register", email);
    assert.equal((await post("/register/send-otp", { email })).status, 200);
  }
  await skipCooldown("register", email);
  const sixth = await post("/register/send-otp", { email });
  assert.equal(sixth.status, 429);
  assert.equal(sixth.body.message, "Too many OTP requests. Please try again later.");
});

test("registration: already-registered email -> 409 on Verify Email; Admin role can never sign up", async () => {
  assert.equal((await post("/register/send-otp", { email: "sowmya@example.com" })).status, 409);
  const token = await verifyEmail("boss@example.com");
  assert.equal((await post("/register", reg({ email: "boss@example.com", role: "Admin", verificationToken: token }))).status, 403);
  assert.equal(await User.countDocuments({ email: "boss@example.com" }), 0);
});

test("registration: NGO role gets its NGO record only when the account is created", async () => {
  const NGO = require("../models/NGO");
  const email = "ngo@example.com";
  const token = await verifyEmail(email);
  assert.equal(await NGO.countDocuments({ email }), 0, "verifying the email alone creates nothing");
  assert.equal((await post("/register", reg({ email, role: "NGO", name: "Helping Hands", verificationToken: token }))).status, 201);
  assert.equal((await User.findOne({ email })).role, "ngo");
  assert.equal(await NGO.countDocuments({ email }), 1);
});

// ------------------------------------------------------------------ FORGOT PASSWORD

test("forgot password: unregistered email -> 404 with the required message, no OTP sent", async () => {
  const sentBefore = outbox.length;
  const r = await post("/forgot-password", { email: "ghost@example.com" });
  assert.equal(r.status, 404);
  assert.equal(
    r.body.message,
    "This email is not registered with FoodSaver AI. Please enter the email used to create your account."
  );
  assert.equal(outbox.length, sentBefore);
});

test("forgot password: full happy path, password is bcrypt-hashed, new password logs in, old one doesn't", async () => {
  const email = "sowmya@example.com";
  const oldHash = (await User.findOne({ email })).password;

  const r1 = await post("/forgot-password", { email });
  assert.equal(r1.status, 200);
  assert.ok(!JSON.stringify(r1.body).match(/\b\d{6}\b/), "OTP must not be in the response");
  const code = lastOtp(email);

  const stored = await OtpVerification.findOne({ purpose: "reset", email });
  assert.notEqual(stored.otpHash, code);

  // Cannot reset without verification: no token / forged token / OTP-as-token
  assert.equal((await post("/reset-password", { password: "brandNew1" })).status, 401);
  assert.equal((await post("/reset-password", { resetToken: "f".repeat(64), password: "brandNew1" })).status, 401);
  assert.equal((await post("/reset-password", { resetToken: code, password: "brandNew1" })).status, 401);
  assert.equal((await post("/validate-reset-token", { resetToken: "f".repeat(64) })).status, 401);
  assert.equal((await User.findOne({ email })).password, oldHash, "password must be untouched so far");

  const v = await post("/verify-reset-otp", { email, otp: code });
  assert.equal(v.status, 200);
  assert.ok(v.body.resetToken);
  const st = await OtpVerification.findOne({ purpose: "reset", email });
  assert.notEqual(st.proofTokenHash, v.body.resetToken, "reset token stored hashed only");

  assert.equal((await post("/validate-reset-token", { resetToken: v.body.resetToken })).status, 200);

  // OTP is single-use
  assert.equal((await post("/verify-reset-otp", { email, otp: code })).status, 400);

  // too-short password rejected, token still usable afterwards
  assert.equal((await post("/reset-password", { resetToken: v.body.resetToken, password: "123" })).status, 400);

  const done = await post("/reset-password", { resetToken: v.body.resetToken, password: "brandNew1" });
  assert.equal(done.status, 200);

  const after = (await User.findOne({ email })).password;
  assert.notEqual(after, "brandNew1");
  assert.ok(after.startsWith("$2"), "stored as a bcrypt hash");
  assert.ok(await bcrypt.compare("brandNew1", after));

  assert.equal((await post("/login", { email, password: "secret123" })).status, 401);
  assert.equal((await post("/login", { email, password: "brandNew1" })).status, 200);

  // token cannot be replayed
  assert.equal((await post("/reset-password", { resetToken: v.body.resetToken, password: "another123" })).status, 401);
});

test("forgot password: incorrect OTP, lockout after 5, and expired OTP", async () => {
  const email = "sowmya@example.com";
  await skipCooldown("reset", email);
  await post("/forgot-password", { email });
  const good = lastOtp(email);
  const bad = good === "123456" ? "654321" : "123456";

  const r = await post("/verify-reset-otp", { email, otp: bad });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Invalid OTP. Please try again.");
  assert.equal(r.body.resetToken, undefined);

  for (let i = 0; i < 4; i++) await post("/verify-reset-otp", { email, otp: bad });
  const locked = await post("/verify-reset-otp", { email, otp: good });
  assert.notEqual(locked.status, 200, "correct OTP must not work after lockout");

  await skipCooldown("reset", email);
  await post("/forgot-password", { email });
  const fresh = lastOtp(email);
  await OtpVerification.updateOne({ purpose: "reset", email }, { $set: { otpExpiresAt: new Date(Date.now() - 1000) } });
  const exp = await post("/verify-reset-otp", { email, otp: fresh });
  assert.equal(exp.status, 400);
  assert.equal(exp.body.message, "OTP has expired. Please request a new OTP.");
});

test("forgot password: resend cooldown + old OTP invalidated + expired reset token rejected", async () => {
  const email = "sowmya@example.com";
  await skipCooldown("reset", email);
  await post("/forgot-password", { email });
  const first = lastOtp(email);

  assert.equal((await post("/forgot-password", { email })).status, 429);

  await skipCooldown("reset", email);
  assert.equal((await post("/forgot-password", { email })).status, 200);
  const second = lastOtp(email);
  if (second !== first) assert.equal((await post("/verify-reset-otp", { email, otp: first })).status, 400);

  const v = await post("/verify-reset-otp", { email, otp: second });
  assert.equal(v.status, 200);
  await OtpVerification.updateOne({ purpose: "reset", email }, { $set: { proofTokenExpiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await post("/reset-password", { resetToken: v.body.resetToken, password: "lateAttempt1" })).status, 401);
  assert.equal((await post("/validate-reset-token", { resetToken: v.body.resetToken })).status, 401);
});

test("forgot password: a registration OTP cannot be used to reset a password (flows are separate)", async () => {
  await post("/register/send-otp", { email: "separate@example.com" });
  const regCode = lastOtp("separate@example.com");
  // that email is not a user yet, and a reset-purpose OTP does not exist for it
  const r = await post("/verify-reset-otp", { email: "separate@example.com", otp: regCode });
  assert.equal(r.status, 400);
  assert.equal(r.body.resetToken, undefined);
});

// ------------------------------------------------------------------ PER-IP LIMITER

test("per-IP rate limiter blocks bursts with 429 + Retry-After", async () => {
  const rateLimit = require("../middleware/rateLimit");
  const limited = express();
  limited.post("/x", rateLimit({ windowMs: 60_000, max: 3 }), (req, res) => res.json({ ok: true }));
  const srv = await new Promise((r) => { const sv = limited.listen(0, () => r(sv)); });
  const url = `http://127.0.0.1:${srv.address().port}/x`;
  const codes = [];
  let retryAfter;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { method: "POST" });
    codes.push(res.status);
    if (res.status === 429) retryAfter = res.headers.get("retry-after");
  }
  srv.close();
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
  assert.ok(Number(retryAfter) > 0);
});

// ------------------------------------------------- "Verify" click: mailbox check

test("verify-email: bad format -> 400, no DNS/OTP/email", async () => {
  const before = outbox.length;
  for (const email of ["", "no-at-sign.com", "missing@domain", "@nouser.com"]) {
    const r = await post("/register/verify-email", { email });
    assert.equal(r.status, 400, email);
    assert.equal(r.body.message, "Please enter a valid email address.");
  }
  assert.equal(outbox.length, before);
});

test("verify-email: NOT_SAFE (domain without MX/NXDOMAIN) -> 422 EMAIL_UNVERIFIED, no OTP stored, no email", async () => {
  const email = "someone@no-such-domain.invalid";
  const before = outbox.length;
  const r = await post("/register/verify-email", { email });
  assert.equal(r.status, 422);
  assert.equal(r.body.code, "EMAIL_UNVERIFIED");
  assert.equal(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email }), 0);
  assert.equal(outbox.length, before);
});

test("verify-email: NOT_SAFE (recipient MX says the mailbox does not exist) -> 422, no OTP stored, no email", async () => {
  const email = "missing-mailbox@example.com";
  const before = outbox.length;
  const r = await post("/register/verify-email", { email });
  assert.equal(r.status, 422);
  assert.equal(r.body.code, "EMAIL_UNVERIFIED");
  assert.equal(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email }), 0);
  assert.equal(outbox.length, before);
});

test("verify-email: UNKNOWN (inconclusive check) -> 503 EMAIL_CHECK_UNKNOWN, never 'doesn't exist', no OTP, no email", async () => {
  const UNKNOWN = "We couldn't verify this email right now. Please try again.";
  for (const email of ["inconclusive@example.com", "dnsflaky@example.com"]) {
    const before = outbox.length;
    const r = await post("/register/verify-email", { email });
    assert.equal(r.status, 503, email);
    assert.equal(r.body.success, false);
    assert.equal(r.body.code, "EMAIL_CHECK_UNKNOWN");
    assert.equal(r.body.message, UNKNOWN);
    assert.notEqual(r.body.message, UNVERIFIED);
    assert.equal(await OtpVerification.countDocuments({ email }), 0);
    assert.equal(outbox.length, before);
  }
});

test("verify-email: SAFE -> existing Send OTP runs, OTP emailed, then existing Verify OTP works", async () => {
  const email = "mxok@example.com";
  const r = await post("/register/verify-email", { email });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.success, true);
  assert.equal(r.body.message, "OTP sent successfully");
  const v = await post("/register/verify-otp", { email, otp: lastOtp(email) });
  assert.equal(v.status, 200);
  assert.ok(v.body.verificationToken);
});

test("verify-email: SAFE but our SMTP fails -> 503 send-failure message (NOT 'doesn't exist'), nothing stored", async () => {
  const email = "mxok-smtpfail@example.com";
  failNextSend = true;
  const r = await post("/register/verify-email", { email });
  assert.equal(r.status, 503);
  assert.equal(r.body.code, "EMAIL_SERVICE_ERROR");
  assert.equal(r.body.message, "We couldn't send the verification email right now. Please try again in a few minutes.");
  assert.notEqual(r.body.message, UNVERIFIED);
  assert.equal(await OtpVerification.countDocuments({ email }), 0);
});
