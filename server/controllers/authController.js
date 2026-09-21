const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const NGO = require("../models/NGO");
const sendEmail = require("../services/emailService");
const {
  welcomeUserTemplate,
  adminNewUserTemplate,
  passwordResetTemplate,
} = require("../services/emailTemplates");

// How long a password reset link stays valid.
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Where the React app is served from — used to build the link inside the
// reset email. Never hardcode this; it must work in every environment.
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// A reset token is only ever stored/compared as a SHA-256 hash. The raw
// token lives solely in the URL emailed to the user — never in MongoDB,
// never logged.
function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

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

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: normalizedRole,
    });

    // An NGO account needs an NGO org record to manage — create a minimal
    // one automatically, linked via NGO.user, rather than leaving the
    // account with no organization until an admin manually creates one.
    // The NGO fills in real address/coordinates/accepted-food-types etc.
    // later via PATCH /api/ngos/me (their NGO Profile page).
    if (normalizedRole === "ngo") {
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

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
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

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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

// FORGOT PASSWORD
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).includes("@")) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Same generic response whether or not the account exists — never
    // reveal account existence through this endpoint.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Cryptographically secure random token. The raw value is only ever
    // placed in the emailed URL — MongoDB only ever stores its hash.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;

    try {
      const template = passwordResetTemplate({ name: user.name, resetUrl });
      await sendEmail.sendTemplated({ to: user.email, ...template });
    } catch (emailErr) {
      // Don't let an email-provider hiccup leak account existence via a
      // different status code/message than the generic response below.
      console.error("Password reset email failed:", emailErr.message);
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// RESET PASSWORD
// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedIncomingToken = hashToken(token);

    // select() re-includes the reset fields, which the schema hides by
    // default (select: false).
    const user = await User.findOne({
      passwordResetToken: hashedIncomingToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    // Single-use: clearing these means this exact link can never
    // succeed again, whether the token was valid or has now expired.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

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

module.exports = { register, login, me, updateProfile, forgotPassword, resetPassword };
