const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "FOUND" : "MISSING"
);

/**
 * Original signature — kept exactly as-is so every existing caller
 * (emailRoutes.js, pickupController.js) keeps working unchanged.
 *
 *   sendEmail(to, subject, text, replyTo?) -> Promise<boolean>
 */
const sendEmail = async (to, subject, text, replyTo = null) => {
  try {
    const mailOptions = {
      from: `"FoodSaver AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

/**
 * New, richer helper used by every new email flow added for this feature
 * (registration, donation, expiry, pickup lifecycle). Supports HTML +
 * plain-text fallback and returns a structured result so callers can
 * persist emailStatus/emailType/emailSentAt/emailError without ever
 * throwing — a failed email must never fail the calling operation.
 *
 *   sendEmail.sendTemplated({ to, subject, text, html, replyTo })
 *     -> Promise<{ success: boolean, sentAt: Date|null, error: string|null }>
 */
const sendTemplated = async ({ to, subject, text, html, replyTo = null }) => {
  try {
    if (!to) {
      throw new Error("Missing recipient email address");
    }

    const mailOptions = {
      from: `"FoodSaver AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (html) mailOptions.html = html;
    if (replyTo) mailOptions.replyTo = replyTo;

    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to: ${to} [${subject}]`);
    return { success: true, sentAt: new Date(), error: null };
  } catch (error) {
    console.error(`Email sending failed to ${to} [${subject}]:`, error.message);
    return { success: false, sentAt: null, error: error.message };
  }
};

sendEmail.sendTemplated = sendTemplated;

module.exports = sendEmail;
