const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // server.js already checks this at boot and exits, but guard here too in
  // case this module is ever imported (e.g. by a script) before that check.
  throw new Error("JWT_SECRET is not set. Refusing to start with an insecure default.");
}

/**
 * Verifies the Bearer token on the request, loads the corresponding user
 * from the database (never trusts a role/id embedded only on the client),
 * and attaches it to req.user. This is the single source of truth for
 * "who is making this request" on the backend.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists",
      });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This account has been blocked. Contact support for help.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
}

/**
 * Role gate. Use AFTER requireAuth. Always checks the DB-loaded user
 * (req.user.role), never anything the client sent in the request body,
 * query string, or a selected-role field.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
