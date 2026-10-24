const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const sendEmail = require("../services/emailService");
const OtpVerification = require("../models/OtpVerification");
const {
  PASSWORD_REUSED_BODY,
  isPreviouslyUsedPassword,
  savePasswordToHistory,
  ensureCurrentPasswordInHistory,
} = require("../utils/passwordHistory");
const otp = require("../services/otpService");
const {
  welcomeUserTemplate,
  adminNewUserTemplate,
  passwordResetOtpTemplate,
  registrationOtpTemplate,
} = require("../services/emailTemplates");

const MIN_PASSWORD_LENGTH = 6;
// Shown when OUR mail account/server is the problem (bad SMTP login, network
// down...). That is not the user's email's fault, so it must not blame it.
const REGISTRATION_SEND_FAILED_MESSAGE =
  "We couldn't send the verification email right now. Please try again in a few minutes.";
const REGISTRATION_INVALID_FORMAT_MESSAGE = "Please enter a valid email address.";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Refusing to start with an insecure default.");
}

// The one authorized FoodSaver AI Admin account. Used only to give a
// clearer error when someone tries to log in with this exact address and
// no matching account exists yet — it does not grant admin access by
// itself. Admin access always comes from the account's actual DB role.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "hello.foodsaverai@gmail.com").toLowerCase();

// The existing User model only allows donor/ngo/admin. The frontend's
// Register page currently offers "Food Donor" / "NGO" / "Volunteer" —
// map those onto the existing enum rather than changing the schema.
function normalizeRole(inputRole) {
  const value = String(inputRole || "").toLowerCase();
  if (value.includes("ngo")) return "ngo";
  if (value.includes("admin")) return "admin";
  return "donor"; // "Food Donor", "Volunteer", or anything unrecognized
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address,
  };
}

// ---------------------------------------------------------------------------
// REGISTRATION (email must be verified first)
//
//   POST /api/auth/register/send-otp    "Verify Email" button, and also
//                                       "Resend OTP": emails a verification
//                                       OTP. Nothing else is stored.
//   POST /api/auth/register/verify-otp  backend verifies the OTP -> returns a
//                                       short-lived verificationToken proving
//                                       THIS email was verified.
//   POST /api/auth/register             "Create Account": refused unless it
//                                       carries a valid verificationToken for
//                                       the same email.
// ---------------------------------------------------------------------------

// Creates the User (+ NGO record + emails). Only called after the email OTP
// has been verified by the backend.
async function createVerifiedAccount({ name, email, passwordHash, phone, address, role }) {
  const user = await User.create({
    name,
    email,
    password: passwordHash,
    phone,
    address,
    role,
  });

  // An NGO account needs an NGO org record to manage — create a minimal
  // one automatically, linked via NGO.user, rather than leaving the
  // account with no organization until an admin manually creates one.
  // The NGO fills in real address/coordinates/accepted-food-types etc.
  // later via PATCH /api/ngos/me (their NGO Profile page).
  if (role === "ngo") {
    try {
      await NGO.create({
        user: user._id,
        name: user.name,
        shortName: user.name.slice(0, 40),
        address: user.address || "Not set yet",
        city: "Not set",
        state: "Not set",
        phone: user.phone || "Not set",
        email: user.email,
        latitude: 0,
        longitude: 0,
        location: { type: "Point", coordinates: [0, 0] },
        status: "Closed", // stays closed/unverified until the NGO completes its profile
        verified: false,
      });
    } catch (ngoErr) {
      console.error("Auto-creating NGO record failed:", ngoErr.message);
    }
  }

  // ---- Emails: user must still be able to log in even if both fail ----
  try {
    const userTemplate = welcomeUserTemplate({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    await sendEmail.sendTemplated({ to: user.email, ...userTemplate });
  } catch (emailErr) {
    console.error("Welcome email failed:", emailErr.message);
  }

  try {
    const adminTemplate = adminNewUserTemplate({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      registeredAt: user.createdAt?.toLocaleString?.() || new Date().toLocaleString(),
      userId: user._id,
    });
    await sendEmail.sendTemplated({
      to: process.env.EMAIL_USER,
      ...adminTemplate,
    });
  } catch (emailErr) {
    console.error("Admin new-user email failed:", emailErr.message);
  }

  return user;
}

// Step 1 (and resend): email a verification OTP. No account is created.
const sendRegistrationOtp = async (req, res) => {
  const TAG = "[register/send-otp]";
  try {
    const normalizedEmail = otp.normalizeEmail(req.body.email);
    console.log(`${TAG} (1/5) request received for ${normalizedEmail || "(no email)"}`);
    if (!otp.EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: REGISTRATION_INVALID_FORMAT_MESSAGE });
    }

    // FoodSaver AI account check only. MongoDB says nothing about whether the
    // external mailbox exists — that is decided by actually delivering the OTP.
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    // Free validation: reject domains that cannot receive email at all.
    // This checks the domain's DNS/MX records only; it does not claim that
    // a particular mailbox exists. The OTP proves mailbox access.
    const domainCanReceive = await otp.domainCanReceiveMail(normalizedEmail);
    if (!domainCanReceive) {
      return res.status(400).json({
        success: false,
        code: "EMAIL_DOMAIN_INVALID",
        message: "This email address does not exist. Please enter a valid email address.",
      });
    }

    const issued = await otp.issueOtp({ purpose: "register", email: normalizedEmail });
    if (!issued.ok) {
      return res.status(issued.status).json({
        success: false,
        code: issued.code || "OTP_REQUEST_REJECTED",
        message: issued.message,
        retryAfterSeconds: issued.retryAfterSeconds,
      });
    }

    console.log(`${TAG} (3/5) OTP generated on the server and stored hashed (expires in ${otp.OTP_TTL_MS / 60000} min); the OTP itself is never logged or returned`);

    const template = registrationOtpTemplate({ name: "", otp: issued.otp });
    const emailResult = await sendEmail.sendTemplated({ to: normalizedEmail, ...template });

    if (!emailResult.success) {
      // The new OTP never reached the mail service, so it must not replace
      // the old one: first send -> nothing stored; resend -> the previous OTP
      // is restored and stays valid under its normal rules. Either way no
      // account can be created without a verified OTP.
      await otp.rollbackOtp("register", normalizedEmail, issued.previous);

      // The real SMTP error was already logged in full by emailService.
      // Here we only decide which user-facing message is truthful.
      console.error(
        `[register/send-otp] OTP email to ${normalizedEmail} NOT sent — ` +
          `${emailResult.errorKind}: ${emailResult.errorReason} (${emailResult.error})`
      );

      const isDev = process.env.NODE_ENV !== "production";
      console.error(`${TAG} (5/5) responding 503 — OTP box will NOT open`);
      const debug = isDev
        ? { kind: emailResult.errorKind, code: emailResult.errorCode, reason: emailResult.errorReason, detail: emailResult.error }
        : undefined;

      // Never tell the user that an address does not exist based on SMTP
      // recipient probing. The OTP email is the verification mechanism.
      return res.status(503).json({
        success: false,
        code: "EMAIL_SEND_FAILED",
        message: REGISTRATION_SEND_FAILED_MESSAGE,
        debug,
      });
    }

    console.log(`${TAG} (4/5) email service ACCEPTED the OTP email for ${normalizedEmail} (SMTP reply: ${emailResult.smtpResponse || "n/a"})`);
    console.log(`${TAG} (5/5) responding 200 success — OTP box will open`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      email: normalizedEmail,
      expiresInSeconds: otp.OTP_TTL_MS / 1000,
      resendAvailableInSeconds: otp.RESEND_COOLDOWN_MS / 1000,
      // Development only (never the OTP): what the server actually saw, so the
      // browser Network tab shows WHY the box opened.
      debug:
        process.env.NODE_ENV !== "production"
          ? {
              accepted: emailResult.accepted,
              smtpResponse: emailResult.smtpResponse,
            }
          : undefined,
    });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
};

// Step 2: the backend verifies the OTP. Only a correct OTP yields the token
// that "Create Account" requires.
const verifyRegistrationOtp = async (req, res) => {
  try {
    const normalizedEmail = otp.normalizeEmail(req.body.email);
    const submittedOtp = String(req.body.otp || "").trim();

    if (!otp.EMAIL_REGEX.test(normalizedEmail) || !submittedOtp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }
    if (!/^\d{6}$/.test(submittedOtp)) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit OTP sent to your email.",
      });
    }

    const result = await otp.checkOtp({
      purpose: "register",
      email: normalizedEmail,
      otp: submittedOtp,
    });
    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        code: result.code,
        message: result.message,
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    const verificationToken = await otp.issueProofToken(result.doc, otp.REGISTRATION_PROOF_TTL_MS);

    return res.json({
      success: true,
      message: "Email Verified",
      email: normalizedEmail,
      verificationToken,
      expiresInSeconds: otp.REGISTRATION_PROOF_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
};

// Step 3: "Create Account". Refused unless the backend previously verified
// this exact email (valid, unexpired verificationToken).
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, verificationToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = otp.normalizeEmail(email);
    if (!otp.EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    const normalizedRole = normalizeRole(role);

    // Admin accounts are never created through public signup, regardless
    // of what role text was submitted. The one authorized admin account
    // must be created/configured directly in the database (see
    // server/seed/seedAdmin.js) — a normal signup form can't grant it.
    if (normalizedRole === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts can't be created through public signup. Contact hello.foodsaverai@gmail.com to request admin access.",
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const session = await otp.findProofSession({
      purpose: "register",
      rawToken: verificationToken,
      email: normalizedEmail,
    });
    if (!session) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email with an OTP before creating your account.",
      });
    }

    // Password history: a password this email has EVER used (even on an
    // account that was later deleted) is refused BEFORE anything is created.
    // The email-verification session is untouched, so the user can simply
    // pick another password and submit again.
    if (await isPreviouslyUsedPassword(normalizedEmail, password)) {
      return res.status(400).json(PASSWORD_REUSED_BODY);
    }

    let user;
    try {
      user = await createVerifiedAccount({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(String(password), 10),
        phone,
        address,
        role: normalizedRole,
      });
    } catch (createErr) {
      if (createErr?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
      throw createErr;
    }

    // The verification is single-use.
    await OtpVerification.deleteOne({ _id: session._id });

    // Remember this password (hash only). Never fails the registration: if
    // this write is missed, the current hash is backfilled into history the
    // next time the password changes or the account is deleted.
    try {
      await savePasswordToHistory(normalizedEmail, user.password);
    } catch (historyErr) {
      console.error("Saving password history failed:", historyErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// Friendly labels + articles for the role-mismatch error message, e.g.
// "This account is registered as an Admin and cannot be used as a Food Donor."
const ROLE_LABELS = { donor: "Food Donor", ngo: "NGO", admin: "Admin" };
const ROLE_ARTICLES = { donor: "a", ngo: "an", admin: "an" };

function describeRole(role) {
  const label = ROLE_LABELS[role] || role;
  const article = ROLE_ARTICLES[role] || "a";
  return `${article} ${label}`;
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // The one authorized admin address gets a clearer message than a
      // generic "invalid credentials" — but this never creates an
      // account. Login is login-only; it never falls through to signup.
      if (normalizedEmail === ADMIN_EMAIL) {
        return res.status(404).json({
          success: false,
          message:
            "Admin account is not configured. Please create/configure the authorized administrator account.",
        });
      }

      return res.status(404).json({
        success: false,
        code: "ACCOUNT_NOT_FOUND",
        message: "Account not registered. Please register first.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // A blocked user must never be able to authenticate, no matter how
    // valid their credentials are.
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This account has been blocked. Contact support for help.",
      });
    }

    // The role tab selected on the Login page is only the user's stated
    // intent — never what changes or grants a role. The account's real
    // role always comes from the database (user.role). If the two
    // disagree, reject the login instead of letting the selected tab
    // silently override the account's actual role.
    if (role && role !== user.role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${describeRole(
          user.role
        )} and cannot be used as ${describeRole(role)}.`,
      });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// CURRENT AUTHENTICATED USER
// Backed by requireAuth middleware, which has already verified the JWT
// and loaded the user fresh from the database — this is what the
// frontend calls on load to restore a session and to determine the
// real role (never trusting a locally-cached role for authorization).
const me = async (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
};

// UPDATE PROFILE
// PATCH /api/auth/profile — the only real, backend-validated way to edit a
// profile. Email and role are intentionally NOT editable here: email
// changes need their own verification flow (not built yet — see Phase 2
// notes), and role must never be client-settable.
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      updates.name = String(name).trim();
    }
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (address !== undefined) updates.address = String(address).trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Profile updated", user: publicUser(updatedUser) });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ---------------------------------------------------------------------------
// FORGOT PASSWORD (separate from registration)
//
//   POST /api/auth/forgot-password      email must exist in MongoDB -> OTP sent
//                                       (also used by "Resend OTP")
//   POST /api/auth/verify-reset-otp     backend verifies OTP -> short-lived
//                                       reset token (only proof that allows
//                                       a password change)
//   POST /api/auth/validate-reset-token lets the UI confirm, with the backend,
//                                       that it may show "Create New Password"
//   POST /api/auth/reset-password       { resetToken, password } -> hash + save
// ---------------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = otp.normalizeEmail(req.body.email);

    if (!otp.EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Security: Do NOT reveal whether an email address belongs to a registered account.
      // Return a generic success response so attackers cannot enumerate valid user emails.
      return res.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent. Check your email and enter the OTP to reset your password.",
        email: normalizedEmail,
        expiresInSeconds: otp.OTP_TTL_MS / 1000,
        resendAvailableInSeconds: otp.RESEND_COOLDOWN_MS / 1000,
      });
    }

    const issued = await otp.issueOtp({ purpose: "reset", email: user.email });
    if (!issued.ok) {
      return res.status(issued.status).json({
        success: false,
        code: issued.code || "OTP_REQUEST_REJECTED",
        message: issued.message,
        retryAfterSeconds: issued.retryAfterSeconds,
      });
    }

    const template = passwordResetOtpTemplate({ name: user.name, otp: issued.otp });
    const emailResult = await sendEmail.sendTemplated({ to: user.email, ...template });

    if (!emailResult.success) {
      await otp.discardOtp("reset", user.email);
      return res.status(502).json({
        success: false,
        message: "We could not send the OTP email right now. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully. Check your email and enter the OTP to reset your password.",
      email: user.email,
      expiresInSeconds: otp.OTP_TTL_MS / 1000,
      resendAvailableInSeconds: otp.RESEND_COOLDOWN_MS / 1000,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Verifies the OTP without changing the password. A short-lived reset token
// is issued ONLY after the backend has confirmed the OTP.
const verifyResetOtp = async (req, res) => {
  try {
    const normalizedEmail = otp.normalizeEmail(req.body.email);
    const submittedOtp = String(req.body.otp || "").trim();

    if (!normalizedEmail || !submittedOtp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }
    if (!/^\d{6}$/.test(submittedOtp)) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit OTP sent to your email.",
      });
    }

    const result = await otp.checkOtp({
      purpose: "reset",
      email: normalizedEmail,
      otp: submittedOtp,
    });
    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        code: result.code,
        message: result.message,
      });
    }

    const resetToken = await otp.issueProofToken(result.doc, otp.RESET_TOKEN_TTL_MS);

    return res.json({
      success: true,
      message: "OTP verified successfully. Create your new password.",
      resetToken,
      expiresInSeconds: otp.RESET_TOKEN_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const findResetSession = (rawToken) => otp.findProofSession({ purpose: "reset", rawToken });

// Read-only check used by the reset page before it shows the password form.
const validateResetToken = async (req, res) => {
  try {
    const session = await findResetSession(req.body.resetToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Your password reset session is invalid or has expired. Please verify a new OTP.",
      });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Validate reset token error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
};

// Kept so old clients get a clear answer instead of a 404.
const resetPasswordWithOtp = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Please verify the OTP first, then create your new password.",
  });
};

// RESET PASSWORD
// POST /api/auth/reset-password  { resetToken, password }
// (POST /api/auth/reset-password/:token is kept and behaves identically.)
const resetPassword = async (req, res) => {
  try {
    const rawToken = req.params.token || req.body.resetToken;
    const { password } = req.body;

    if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    const session = await findResetSession(rawToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Your password reset session is invalid or has expired. Please verify a new OTP.",
      });
    }

    const user = await User.findOne({ email: session.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email is not registered with FoodSaver AI.",
      });
    }

    // Password history check — BEFORE the reset session is consumed. A reused
    // password is a normal, retryable mistake: the token stays valid, nothing
    // is changed, and the user stays on "Create New Password".
    // (Legacy accounts: make sure the current hash is in history first.)
    // This backfill is bookkeeping only: isPreviouslyUsedPassword() already
    // compares against the user's current hash too. If the write fails (for
    // example a duplicate-key conflict), it must NOT abort the reset with a
    // generic 500 and hide the reused-password answer.
    try {
      await ensureCurrentPasswordInHistory(user);
    } catch (historyErr) {
      console.error("Backfilling password history failed:", historyErr.message);
    }
    if (await isPreviouslyUsedPassword(user.email, password)) {
      // Same code/shape as everywhere else; only this Create New Password
      // message differs from the registration one.
      return res.status(400).json({
        ...PASSWORD_REUSED_BODY,
        message: "You have used this password already. Please use a new password.",
      });
    }

    // Single use: claim the session before touching the password so the same
    // token can never be replayed, even by two simultaneous requests.
    const claimed = await OtpVerification.findOneAndDelete({
      _id: session._id,
      proofTokenHash: session.proofTokenHash,
    });
    if (!claimed) {
      return res.status(401).json({
        success: false,
        message: "Your password reset session is invalid or has expired. Please verify a new OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const updated = await User.updateOne(
      { email: claimed.email },
      { $set: { password: hashedPassword } }
    );
    if (updated.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "This email is not registered with FoodSaver AI.",
      });
    }

    // Remember the NEW hash. The password is already changed at this point,
    // so a failed history write must not turn a successful reset into an error.
    try {
      await savePasswordToHistory(claimed.email, hashedPassword);
    } catch (historyErr) {
      console.error("Saving password history failed:", historyErr.message);
    }

    res.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


// DELETE ACCOUNT
// Permanently removes the authenticated donor/NGO account and its account-
// owned operational records. Admin accounts cannot be self-deleted here.
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted from this page.",
      });
    }

    // Password history must outlive the account. Make sure the CURRENT
    // password hash is recorded BEFORE anything is deleted (this covers
    // accounts created before password history existed). If this fails we
    // stop, so a password can never silently drop out of history.
    // NOTE: PasswordHistory is deliberately never deleted anywhere.
    await ensureCurrentPasswordInHistory(user);

    if (user.role === "donor") {
      // Remove donations created by this donor and pickups requested for
      // this donor. These records contain the donor's contact information.
      await Pickup.deleteMany({ donor: userId });
      await Donation.deleteMany({ donor: userId });
    }

    if (user.role === "ngo") {
      const ngo = await NGO.findOne({ user: userId });

      if (ngo) {
        // Remove pickup records belonging to this NGO. A pickup contains
        // donor contact details and is part of the NGO's operational data.
        await Pickup.deleteMany({ ngo: ngo._id });

        // Donations accepted by this NGO return to the available pool rather
        // than being left pointing at a deleted NGO.
        await Donation.updateMany(
          { ngo: ngo._id },
          {
            $set: {
              status: "Available",
              ngo: null,
              pickup: null,
            },
          }
        );

        await NGO.deleteOne({ _id: ngo._id });
      }
    }

    // Remove personal activity/notification history for the account.
    await Activity.deleteMany({ userId });
    await Notification.deleteMany({ userId });

    await User.deleteOne({ _id: userId });

    return res.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete your account right now. Please try again later.",
    });
  }
};

module.exports = {
  register,
  sendRegistrationOtp,
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
};
