const express = require("express");
const sendEmail = require("../services/emailService");

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail(
      email,
      "FoodSaver AI Test",
      "Email notification system is working."
    );

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/contact-admin", async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Email, subject and message are required",
      });
    }

    const emailText = `
FoodSaver AI User Message

User Email: ${email}

Subject: ${subject}

Message:
${message}
    `;

    const sent = await sendEmail(
      process.env.EMAIL_USER,
      subject,
      emailText,
      email
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
      });
    }

    res.json({
      success: true,
      message: "Message sent successfully to FoodSaver AI admin",
    });
  } catch (error) {
    console.error("Contact admin error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

module.exports = router;