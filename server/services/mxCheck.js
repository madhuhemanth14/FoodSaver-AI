/**
 * Free pre-OTP email-domain check using Node's built-in DNS (no npm package,
 * no API key, no third-party service).
 *
 *   dns.promises.resolveMx(domain)
 *
 * WHAT THIS PROVES: the domain publishes at least one mail server.
 * WHAT IT DOES NOT PROVE: that the individual mailbox exists. The OTP the
 * user types in later is the only proof they can read that mailbox.
 *
 * Result { status, domain, detail }:
 *   "valid"           >= 1 usable MX record          -> continue to Send OTP
 *   "invalid"         domain does not exist, or has no (usable) MX records
 *                                                    -> "Email doesn't exist..."
 *   "temporary_error" SERVFAIL / timeout / network / anything we cannot decide
 *                                                    -> "We couldn't verify..."
 * Format problems are reported as "bad_format" without touching DNS.
 *
 * `detail` is for backend logs only; never send it to the browser.
 */

const dns = require("dns").promises; // property looked up at call time (stub-friendly)

const DNS_TIMEOUT_MS = 5000;

// Only these answers mean "this domain cannot receive email":
//   ENOTFOUND  - NXDOMAIN (domain does not exist)
//   ENODATA    - domain exists but has no MX record
//   ENOTIMP/EBADNAME are malformed-name answers, also definitive.
const DEFINITIVE_NO_MAIL_CODES = new Set(["ENOTFOUND", "ENODATA", "EBADNAME", "ENOTIMP"]);

// Basic, deliberately loose shape check (same rule the rest of the app uses)
// plus a hostname sanity check on the domain part.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_SHAPE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** Returns the lower-cased domain of a well-formed address, or "" if malformed. */
function extractDomain(email) {
  const value = String(email || "").trim();
  if (!EMAIL_SHAPE.test(value)) return "";
  const at = value.lastIndexOf("@");
  const domain = value.slice(at + 1).toLowerCase().replace(/\.$/, "");
  // IDN domains: resolve the ASCII (punycode) form.
  let ascii = domain;
  try {
    ascii = new URL(`http://${domain}`).hostname;
  } catch {
    return "";
  }
  return DOMAIN_SHAPE.test(ascii) ? ascii : "";
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`DNS lookup timed out after ${ms}ms`);
      err.code = "ETIMEOUT";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function checkEmailDomain(email, { timeoutMs = DNS_TIMEOUT_MS } = {}) {
  const domain = extractDomain(email);
  if (!domain) return { status: "bad_format", domain: "", detail: "malformed address or domain" };

  try {
    const records = await withTimeout(dns.resolveMx(domain), timeoutMs);
    // RFC 7505 "null MX" (a single "." exchange) means "this domain accepts no mail".
    const usable = (Array.isArray(records) ? records : []).filter(
      (r) => r && typeof r.exchange === "string" && r.exchange.trim() !== "" && r.exchange.trim() !== "."
    );
    if (usable.length > 0) {
      return { status: "valid", domain, detail: `${usable.length} MX record(s)` };
    }
    return { status: "invalid", domain, detail: "no usable MX records" };
  } catch (err) {
    const code = err && err.code ? String(err.code) : "UNKNOWN";
    if (DEFINITIVE_NO_MAIL_CODES.has(code)) {
      return { status: "invalid", domain, detail: `DNS ${code}` };
    }
    // SERVFAIL, REFUSED, ETIMEOUT, ETIMEDOUT, ECONNREFUSED, EAI_AGAIN, ...:
    // we could not decide, which is not evidence about the address.
    return { status: "temporary_error", domain, detail: `DNS ${code}: ${err && err.message}` };
  }
}

module.exports = { checkEmailDomain, extractDomain, DNS_TIMEOUT_MS };
