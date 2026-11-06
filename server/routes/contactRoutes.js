const express = require("express");
const { submitContact } = require("../controllers/contactController");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many contact inquiries received from this IP address. Please wait 15 minutes before submitting again.",
});

// POST /api/contact
router.post("/", contactLimiter, submitContact);

module.exports = router;
