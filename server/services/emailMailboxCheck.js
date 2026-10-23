/**
 * Free mailbox-reachability check that runs BEFORE the registration OTP is
 * sent. Uses only what the project already has: Node's built-in dns and net
 * (through services/mxCheck.js and services/recipientCheck.js). No npm
 * package, no API key, no third-party validation service, no message sent.
 *
 *   1. checkEmailDomain(email)  - DNS MX lookup (does the domain take mail?)
 *   2. probeRecipient(email)    - SMTP conversation with the recipient's own
 *                                 MX: EHLO / MAIL FROM / RCPT TO / QUIT
 *
 * Result:  { status: "safe" | "not_safe" | "unknown", reason, detail }
 *
 *   safe      the recipient's mail server accepted RCPT TO for this address.
 *   not_safe  ONLY definitive evidence: the domain does not exist / has no
 *             (or a null) MX, or the recipient's MX answered RCPT TO with an
 *             explicit permanent "no such mailbox" reply (550/551/553, 5.1.x).
 *   unknown   everything else: DNS SERVFAIL/timeout, blocked or refused port
 *             25, connection timeout, greylisting (4xx), policy / reputation
 *             blocks (5.7.x), servers that will not reveal mailbox existence,
 *             protocol trouble, probe switched off. NEVER treated as not_safe.
 *
 * Honest limits: MX alone does not prove a mailbox exists (it only shows the
 * domain takes mail), and "safe" means the server accepted the recipient - a
 * catch-all domain accepts everything. Only entering the OTP proves the user
 * can read the mailbox. `detail` is for server logs only; never send it to the
 * browser. Nothing here logs passwords, OTPs or SMTP credentials.
 */

const { checkEmailDomain } = require("./mxCheck");
const { probeRecipient } = require("./recipientCheck");

async function checkMailbox(email, { mailFrom } = {}) {
  const domainCheck = await checkEmailDomain(email);

  if (domainCheck.status === "bad_format") {
    // The controller validates the format first; this is just a safe net.
    return { status: "unknown", reason: "bad_format", detail: domainCheck.detail };
  }
  if (domainCheck.status === "invalid") {
    // NXDOMAIN / no MX / null MX: this domain cannot receive email at all.
    return { status: "not_safe", reason: "domain_cannot_receive_mail", detail: domainCheck.detail };
  }
  if (domainCheck.status !== "valid") {
    // Our resolver could not decide - that is not evidence about the address.
    return { status: "unknown", reason: "dns_inconclusive", detail: domainCheck.detail };
  }

  const probe = await probeRecipient(email, { mailFrom });
  if (probe.status === "exists") {
    return { status: "safe", reason: "recipient_accepted", detail: probe.detail };
  }
  if (probe.status === "not_found") {
    return { status: "not_safe", reason: "mailbox_rejected", detail: probe.detail };
  }
  return { status: "unknown", reason: "smtp_inconclusive", detail: probe.detail };
}

module.exports = { checkMailbox };
