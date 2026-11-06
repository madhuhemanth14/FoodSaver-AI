const express = require("express");
const sendEmail = require("../services/emailService");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_RECIPIENT =
  process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "hello.foodsaverai@gmail.com";

// Rate limiters to prevent mail abuse, open relay exploitation, and mailbox flooding
const emailTestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many email tests requested. Please wait 15 minutes before testing again.",
});

const contactAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many messages sent. Please wait 15 minutes before sending another message.",
});

/**
 * POST /api/email/test
 * Dedicated system diagnostic endpoint.
 * Strictly protected: Requires authenticated Administrator privileges,
 * rigorous recipient validation, and rate limiting to prevent open relay exploitation.
 */
router.post("/test", requireAuth, requireRole("admin"), emailTestLimiter, async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    if (!rawEmail) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required.",
      });
    }

    if (rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({
        success: false,
        message: "A valid recipient email address is required.",
      });
    }

    // CRLF check to prevent any potential header injection
    if (/[\r\n]/.test(rawEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid characters in recipient email address.",
      });
    }

    const result = await sendEmail(
      rawEmail,
      "FoodSaver AI — System Diagnostic Test",
      `Hello ${req.user.name || "Admin"},\n\nThis is an automated diagnostic email confirming that the FoodSaver AI mail delivery subsystem is configured and operational.\n\nTriggered by: ${req.user.email}\nTimestamp: ${new Date().toISOString()}\nEnvironment: ${process.env.NODE_ENV || "development"}`
    );

    if (result && result.success === false) {
      return res.status(502).json({
        success: false,
        message: "Failed to dispatch test email. Please verify SMTP credentials.",
        errorKind: result.errorKind || "service",
      });
    }

    res.json({
      success: true,
      message: `Diagnostic test email dispatched successfully to ${rawEmail}.`,
    });
  } catch (error) {
    console.error("Email test endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "An internal error occurred while executing the diagnostic test.",
    });
  }
});

/**
 * POST /api/email/contact-admin
 * User contact endpoint for administrative correspondence.
 * Protected with rate limiting, input sanitization, and CRLF header injection prevention.
 */
router.post("/contact-admin", contactAdminLimiter, async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "").trim();
    const rawSubject = String(req.body?.subject || "").trim();
    const rawMessage = String(req.body?.message || "").trim();

    const errors = {};
    if (!rawEmail) {
      errors.email = "Email address is required.";
    } else if (rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
      errors.email = "A valid email address is required.";
    }

    if (!rawSubject) {
      errors.subject = "Subject is required.";
    } else if (rawSubject.length < 3) {
      errors.subject = "Subject must be at least 3 characters long.";
    } else if (rawSubject.length > 150) {
      errors.subject = "Subject must not exceed 150 characters.";
    }

    if (!rawMessage) {
      errors.message = "Message body is required.";
    } else if (rawMessage.length < 10) {
      errors.message = "Message must be at least 10 characters long.";
    } else if (rawMessage.length > 3000) {
      errors.message = "Message must not exceed 3000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // Strip carriage return and newline characters from subject to eliminate CRLF injection
    const cleanSubject = `[FoodSaver AI Contact] ${rawSubject.replace(/[\r\n]+/g, " ").trim()}`;

    const emailText = [
      "New FoodSaver AI Inquiry",
      "-------------------------",
      `Sender: ${rawEmail}`,
      `Subject: ${rawSubject.replace(/[\r\n]+/g, " ")}`,
      `Date: ${new Date().toLocaleString()}`,
      "",
      "Message:",
      rawMessage,
    ].join("\n");

    const emailHtml = `
      <h3>New FoodSaver AI Inquiry</h3>
      <p><strong>Sender:</strong> ${rawEmail}</p>
      <p><strong>Subject:</strong> ${rawSubject.replace(/[\r\n]+/g, " ")}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${rawMessage.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>
    `;

    const result = await sendEmail.sendTemplated({
      to: ADMIN_RECIPIENT,
      subject: cleanSubject,
      text: emailText,
      html: emailHtml,
      replyTo: rawEmail,
    });

    if (result && result.success === false) {
      console.error("Failed to forward contact inquiry:", result.error);
      return res.status(502).json({
        success: false,
        message: "Unable to deliver inquiry to the administrator at this time. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Your inquiry has been successfully delivered to the FoodSaver AI administration.",
    });
  } catch (error) {
    console.error("Contact admin route error:", error);
    res.status(500).json({
      success: false,
      message: "An internal error occurred while dispatching the message.",
    });
  }
});

module.exports = router;