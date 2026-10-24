const nodemailer = require("nodemailer");

// Trim stray whitespace / CR characters. A Gmail App Password is shown as
// "abcd efgh ijkl mnop"; the spaces are not part of it, so they are removed
// before authenticating (pasting it with spaces is a common cause of EAUTH).
const EMAIL_USER = String(process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = String(process.env.EMAIL_PASS || "").replace(/\s+/g, "");

// Explicit SMTP settings (defaults = Gmail STARTTLS on port 587 or SSL on 465).
// Override in server/.env with SMTP_HOST / SMTP_PORT / SMTP_SECURE if needed.
const SMTP_HOST = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE =
  process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== ""
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === "true"
    : SMTP_PORT === 465;

// Optional HTTP API credentials (bypasses raw SMTP port restrictions on hosts like Render Free Tier).
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || "").trim();
const BREVO_API_KEY = String(process.env.BREVO_API_KEY || "").trim();

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // Fail fast with a clear ETIMEDOUT instead of hanging for 30s.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
  },
});

const activeProvider = RESEND_API_KEY
  ? "Resend (HTTPS API)"
  : BREVO_API_KEY
  ? "Brevo (HTTPS API)"
  : `SMTP (${SMTP_HOST}:${SMTP_PORT}, secure=${SMTP_SECURE})`;

console.log(`[email] Active provider: ${activeProvider}`);
console.log("EMAIL_USER:", EMAIL_USER || "MISSING");
console.log("EMAIL_PASS:", EMAIL_PASS ? "FOUND" : "MISSING");
if (RESEND_API_KEY) console.log("RESEND_API_KEY: CONFIGURED");
if (BREVO_API_KEY) console.log("BREVO_API_KEY: CONFIGURED");

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
if (process.env.NODE_ENV !== "test" && typeof transporter?.verify === "function") {
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
 * Sends email via Resend REST API (HTTPS port 443) if RESEND_API_KEY is configured.
 */
async function sendViaResend({ to, subject, text, html, replyTo = null }) {
  if (!RESEND_API_KEY) return null;

  const from = process.env.RESEND_FROM || `FoodSaver AI <${EMAIL_USER || "onboarding@resend.dev"}>`;
  const payload = {
    from,
    to: [to],
    subject,
    text,
    html: html || undefined,
  };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.message || data?.error || `Resend HTTP ${response.status}`;
    const err = new Error(msg);
    err.code = "RESEND_API_ERROR";
    throw err;
  }

  console.log(`[email] Sent via Resend API to: ${to} (id: ${data.id})`);
  return {
    success: true,
    sentAt: new Date(),
    error: null,
    accepted: [to],
    smtpResponse: `250 OK (Resend: ${data.id})`,
    messageId: data.id,
    provider: "resend",
  };
}

/**
 * Sends email via Brevo REST API (HTTPS port 443) if BREVO_API_KEY is configured.
 */
async function sendViaBrevo({ to, subject, text, html, replyTo = null }) {
  if (!BREVO_API_KEY) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || EMAIL_USER || "hello.foodsaverai@gmail.com";
  const payload = {
    sender: { name: "FoodSaver AI", email: senderEmail },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html || undefined,
  };
  if (replyTo) payload.replyTo = { email: replyTo };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.message || `Brevo HTTP ${response.status}`;
    const err = new Error(msg);
    err.code = "BREVO_API_ERROR";
    throw err;
  }

  console.log(`[email] Sent via Brevo API to: ${to} (id: ${data.messageId})`);
  return {
    success: true,
    sentAt: new Date(),
    error: null,
    accepted: [to],
    smtpResponse: `250 OK (Brevo: ${data.messageId})`,
    messageId: data.messageId,
    provider: "brevo",
  };
}

/**
 * Original signature — kept exactly as-is so every existing caller
 * (emailRoutes.js, pickupController.js) keeps working unchanged.
 *
 *   sendEmail(to, subject, text, replyTo?) -> Promise<boolean>
 */
const sendEmail = async (to, subject, text, replyTo = null) => {
  try {
    // If an HTTP API is configured, use it for reliability across cloud firewalls
    if (RESEND_API_KEY || BREVO_API_KEY) {
      const result = await sendTemplated({ to, subject, text, replyTo });
      return result.success;
    }

    const mailOptions = {
      from: `"FoodSaver AI" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    logMailError(`sendEmail to ${to}`, error);
    return false;
  }
};

/**
 * Rich helper used by every email flow (registration, password reset,
 * donation, expiry, pickup lifecycle). Supports HTML + plain-text fallback
 * and returns a structured result so callers can handle delivery status gracefully.
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

    // 1. Try Resend if configured
    if (RESEND_API_KEY) {
      const resendResult = await sendViaResend({ to, subject, text, html, replyTo });
      if (resendResult) return resendResult;
    }

    // 2. Try Brevo if configured
    if (BREVO_API_KEY) {
      const brevoResult = await sendViaBrevo({ to, subject, text, html, replyTo });
      if (brevoResult) return brevoResult;
    }

    // 3. Fall back to SMTP (Gmail / custom SMTP host)
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
      provider: "smtp",
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
