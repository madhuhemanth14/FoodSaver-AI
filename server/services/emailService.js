const nodemailer = require("nodemailer");

// Trim stray whitespace / CR characters. A Gmail App Password is shown as
// "abcd efgh ijkl mnop"; the spaces are not part of it, so they are removed
// before authenticating (pasting it with spaces is a common cause of EAUTH).
const EMAIL_USER = String(process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = String(process.env.EMAIL_PASS || "").replace(/\s+/g, "");

// Explicit SMTP settings (defaults = Gmail over implicit TLS). Override in
// server/.env with SMTP_HOST / SMTP_PORT / SMTP_SECURE if needed, e.g.
//   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587  SMTP_SECURE=false   (STARTTLS)
const SMTP_HOST = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_SECURE =
  process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== ""
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === "true"
    : SMTP_PORT === 465;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // Fail fast with a clear ETIMEDOUT instead of hanging the Verify click.
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
  },
});

console.log(`SMTP: host=${SMTP_HOST} port=${SMTP_PORT} secure=${SMTP_SECURE}`);
console.log("EMAIL_USER:", EMAIL_USER || "MISSING");
console.log("EMAIL_PASS:", EMAIL_PASS ? "FOUND" : "MISSING");

/**
 * Works out WHY a send failed, so callers can tell "this recipient address
 * cannot receive mail" (the user should fix their email) apart from "our own
 * mail account/server is broken" (nothing the user can fix).
 *
 *   kind "recipient" -> the mail server refused this recipient / address
 *   kind "service"   -> SMTP auth, credentials, connection, TLS, timeout,
 *                       missing configuration, or anything we cannot pin on
 *                       the recipient
 */
function classifyMailError(error) {
  const code = error && error.code ? String(error.code) : "";
  const command = error && error.command ? String(error.command) : "";
  const responseCode = error && error.responseCode ? Number(error.responseCode) : 0;
  const rejected = error && Array.isArray(error.rejected) ? error.rejected : [];
  const message = (error && error.message) || String(error || "Unknown email error");

  // Default: OUR side. Only explicit SMTP evidence that the RECIPIENT was
  // refused (below) may blame the user's address. Auth, credentials, config,
  // connection, TLS, timeouts, temporary (4xx) replies and unknown exceptions
  // are never proof that a mailbox does not exist.
  let kind = "service";
  let reason = "Email provider error";

  if (code === "MISSING_CONFIG") {
    reason = "Email service is not configured (EMAIL_USER / EMAIL_PASS missing)";
  } else if (code === "EAUTH" || responseCode === 535 || command.startsWith("AUTH")) {
    reason = "SMTP authentication failure / invalid credentials (check EMAIL_USER and the Gmail App Password)";
  } else if (
    ["ECONNECTION", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ESOCKET", "EDNS", "ENOTFOUND", "EHOSTUNREACH", "ENETUNREACH", "EPROTOCOL"].includes(code)
  ) {
    reason = "SMTP connection failure (server unreachable, refused, timed out or protocol error)";
  } else if (code === "ETLS" || /certificate|\btls\b|\bssl\b/i.test(message)) {
    reason = "SMTP TLS/SSL failure";
  } else if (responseCode >= 400 && responseCode < 500) {
    reason = `SMTP temporary rejection (${responseCode}) — not proof the recipient is invalid`;
  } else if (command === "RCPT TO" && responseCode >= 500) {
    kind = "recipient";
    reason = `Recipient refused by the mail server (RCPT TO, ${responseCode})`;
  } else if (rejected.length > 0 && (!responseCode || responseCode >= 500)) {
    kind = "recipient";
    reason = "Recipient rejected by the mail server";
  } else if (/no recipients defined|invalid recipient/i.test(message)) {
    kind = "recipient";
    reason = "Recipient address invalid";
  } else if (responseCode >= 500) {
    reason = `SMTP rejection (${responseCode}) that is not tied to the recipient`;
  }

  return { kind, reason, code: code || null, command: command || null, responseCode: responseCode || null, detail: message };
}

// Full technical detail goes to the server log only — never to the user.
function logMailError(context, error) {
  const info = classifyMailError(error);
  console.error(
    `[email] ${context} failed -> ${info.kind.toUpperCase()} problem: ${info.reason}\n` +
      `        code=${info.code} command=${info.command} responseCode=${info.responseCode}\n` +
      `        detail=${info.detail}`
  );
  return info;
}

// One-off startup check: logs whether we can log in to the SMTP server at
// all, so a broken EMAIL_USER / EMAIL_PASS is visible immediately instead of
// showing up later as a failed verification email.
if (process.env.NODE_ENV !== "test") {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("[email] SMTP NOT configured: set EMAIL_USER and EMAIL_PASS (Gmail App Password) in server/.env");
  } else {
    transporter
      .verify()
      .then(() => console.log(`[email] SMTP connection and login OK (${SMTP_HOST}:${SMTP_PORT}, sender ${EMAIL_USER}) — ready to send email`))
      .catch((error) => logMailError("SMTP startup check", error));
  }
}

/**
 * Original signature — kept exactly as-is so every existing caller
 * (emailRoutes.js, pickupController.js) keeps working unchanged.
 *
 *   sendEmail(to, subject, text, replyTo?) -> Promise<boolean>
 */
const sendEmail = async (to, subject, text, replyTo = null) => {
  try {
    const mailOptions = {
      from: `"FoodSaver AI" <${EMAIL_USER}>`,
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
    logMailError(`sendEmail to ${to}`, error);
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
      const err = new Error("Missing recipient email address");
      err.code = "EENVELOPE";
      throw err;
    }
    if (!EMAIL_USER || !EMAIL_PASS) {
      const err = new Error("EMAIL_USER / EMAIL_PASS are not set in server/.env");
      err.code = "MISSING_CONFIG";
      throw err;
    }

    const mailOptions = {
      from: `"FoodSaver AI" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (html) mailOptions.html = html;
    if (replyTo) mailOptions.replyTo = replyTo;

    const info = await transporter.sendMail(mailOptions);

    // The SMTP server can refuse a recipient outright (unknown domain,
    // mailbox rejected at RCPT TO). Treat that as a failed send.
    if (info && Array.isArray(info.rejected) && info.rejected.length > 0) {
      const err = new Error(`Recipient rejected by mail server: ${info.rejected.join(", ")}`);
      err.code = "REJECTED_RECIPIENT";
      err.rejected = info.rejected;
      throw err;
    }

    // "Success" needs positive proof: the server must have ACCEPTED at least
    // one recipient. An empty accepted list is never treated as sent.
    const accepted = info && Array.isArray(info.accepted) ? info.accepted : [];
    if (accepted.length === 0) {
      const err = new Error("Mail server did not accept any recipient for this message");
      err.code = "NO_ACCEPTED_RECIPIENT";
      throw err;
    }

    console.log(
      `Email sent successfully to: ${to} [${subject}] — accepted by ${SMTP_HOST}: ` +
        `${accepted.join(", ")} | SMTP reply: ${info.response || "(none)"}`
    );
    return {
      success: true,
      sentAt: new Date(),
      error: null,
      accepted,
      smtpResponse: info.response || null,
      messageId: info.messageId || null,
    };
  } catch (error) {
    const info = logMailError(`send to ${to} [${subject}]`, error);
    return {
      success: false,
      sentAt: null,
      error: error.message,
      // "recipient" = that address can't receive mail; "service" = our own
      // SMTP account/connection problem. See classifyMailError().
      errorKind: info.kind,
      errorCode: info.code,
      errorReason: info.reason,
    };
  }
};

sendEmail.sendTemplated = sendTemplated;
sendEmail.classifyMailError = classifyMailError;

module.exports = sendEmail;
