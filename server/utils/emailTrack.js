const sendEmail = require("../services/emailService");

/**
 * Sends a templated email and records the outcome on the given mongoose
 * document's emailStatus/emailType/emailSentAt/emailError fields.
 * Never throws — a failed email must never fail the calling operation.
 *
 * @param {import("mongoose").Document} doc - document with the 4 email-tracking fields
 * @param {string} type - short label stored in emailType, e.g. "donation_admin"
 * @param {{to:string, subject:string, text:string, html?:string, replyTo?:string}} mail
 */
async function sendAndTrack(doc, type, mail) {
  doc.emailType = type;
  doc.emailStatus = "Sending";

  const result = await sendEmail.sendTemplated(mail);

  doc.emailStatus = result.success ? "Sent" : "Failed";
  doc.emailSentAt = result.sentAt || null;
  doc.emailError = result.error || "";

  try {
    await doc.save();
  } catch (saveErr) {
    // Never let a tracking-field save failure surface as an error to the
    // caller of the main operation.
    console.error(`Failed to persist email tracking for ${type}:`, saveErr.message);
  }

  return result;
}

module.exports = { sendAndTrack };
