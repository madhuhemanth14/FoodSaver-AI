const net = require("net");
const dns = require("dns");
const os = require("os");

/**
 * Asks the RECIPIENT'S OWN mail server whether a mailbox exists, without
 * sending any message:  connect to the domain's MX -> EHLO -> MAIL FROM ->
 * RCPT TO:<address> -> QUIT (no DATA, nothing is delivered).
 *
 * Why this exists: an authenticated submission server such as smtp.gmail.com
 * accepts mail for almost any address and reports an unknown mailbox only
 * later, by emailing a bounce. So "the send succeeded" cannot, on its own,
 * show that a Gmail mailbox exists. The recipient's MX, however, answers
 * "550 5.1.1 ... does not exist" immediately.
 *
 * Result:
 *   { status: "not_found", ... }  ONLY when the MX gave an explicit permanent
 *                                 "no such mailbox" reply for RCPT TO.
 *   { status: "exists",    ... }  the MX accepted the recipient.
 *   { status: "unknown",   ... }  anything else — blocked port 25, timeout,
 *                                 refused connection, greylisting (4xx),
 *                                 policy/spam blocks (5.7.x), no MX, protocol
 *                                 trouble. NEVER treated as "doesn't exist".
 *
 * It never uses format, domain name, MongoDB or Google login state.
 */

const PROBE_ENABLED = String(process.env.RECIPIENT_PROBE || "on").toLowerCase() !== "off";
const PROBE_PORT = Number(process.env.RECIPIENT_PROBE_PORT) || 25;
const PROBE_TIMEOUT_MS = Number(process.env.RECIPIENT_PROBE_TIMEOUT_MS) || 8000;
const MAX_MX_TRIES = 2;

// A permanent "this mailbox does not exist" answer. Policy / reputation
// rejections (5.7.x, "blocked", "spam", "policy") are deliberately excluded.
function isMailboxNotFound(code, text) {
  if (![550, 551, 553].includes(code)) return false;
  if (/\b5\.7\.\d+\b|blocked|blacklist|spam|policy|reputation|not authorized|relay/i.test(text)) return false;
  return /\b5\.1\.[1-6]\b|user unknown|unknown user|no such user|does not exist|doesn't exist|mailbox (unavailable|not found)|invalid (recipient|mailbox|address)|recipient (address )?rejected|account.*(disabled|not found)|address not found/i.test(text);
}

// Minimal SMTP client: returns { code, text } for each reply (handles multi-line).
function createDialog(socket, timeoutMs) {
  let buffer = "";
  let waiting = null;

  const tryResolve = () => {
    if (!waiting) return;
    const lines = buffer.split(/\r?\n/);
    for (let i = 0; i < lines.length - 1; i++) {
      // A final line looks like "250 text" (space after the code); "250-" continues.
      if (/^\d{3} /.test(lines[i]) || /^\d{3}$/.test(lines[i])) {
        const text = lines.slice(0, i + 1).join("\n");
        buffer = lines.slice(i + 1).join("\n");
        const w = waiting;
        waiting = null;
        clearTimeout(w.timer);
        w.resolve({ code: Number(lines[i].slice(0, 3)), text });
        return;
      }
    }
  };

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    tryResolve();
  });
  const fail = (err) => {
    if (waiting) {
      const w = waiting;
      waiting = null;
      clearTimeout(w.timer);
      w.reject(err);
    }
  };
  socket.on("error", fail);
  socket.on("close", () => fail(Object.assign(new Error("connection closed"), { code: "ECLOSED" })));

  const reply = () =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        waiting = null;
        reject(Object.assign(new Error("timed out waiting for reply"), { code: "ETIMEDOUT" }));
      }, timeoutMs);
      waiting = { resolve, reject, timer };
      tryResolve();
    });

  const send = (line) => socket.write(line + "\r\n");
  return { reply, send };
}

async function probeHost(host, port, { mailFrom, rcpt, timeoutMs }) {
  const socket = net.connect({ host, port });
  socket.setTimeout(timeoutMs, () => socket.destroy(Object.assign(new Error("socket timeout"), { code: "ETIMEDOUT" })));
  try {
    await new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("error", reject);
    });
    const d = createDialog(socket, timeoutMs);

    const greeting = await d.reply();
    if (greeting.code !== 220) return { status: "unknown", detail: `greeting ${greeting.code}` };

    // Identify as this machine (or RECIPIENT_PROBE_HELO), not as the sender's
    // domain: claiming to be gmail.com from a non-Google IP invites a 5.7.x
    // policy rejection, which can only ever be reported as "unknown".
    const heloDomain =
      String(process.env.RECIPIENT_PROBE_HELO || os.hostname() || "").replace(/[^a-z0-9.-]/gi, "") || "localhost";
    d.send(`EHLO ${heloDomain}`);
    const ehlo = await d.reply();
    if (ehlo.code !== 250) {
      d.send(`HELO ${heloDomain}`);
      const helo = await d.reply();
      if (helo.code !== 250) return { status: "unknown", detail: `HELO/EHLO ${helo.code}` };
    }

    d.send(`MAIL FROM:<${mailFrom}>`);
    const from = await d.reply();
    if (from.code !== 250) return { status: "unknown", detail: `MAIL FROM ${from.code} ${from.text}` };

    d.send(`RCPT TO:<${rcpt}>`);
    const to = await d.reply();
    try {
      d.send("QUIT");
    } catch (_) {
      /* ignore */
    }

    if (to.code === 250 || to.code === 251) return { status: "exists", detail: `RCPT ${to.code}` };
    if (isMailboxNotFound(to.code, to.text)) {
      return { status: "not_found", detail: `RCPT ${to.code} ${to.text.replace(/\s+/g, " ")}` };
    }
    return { status: "unknown", detail: `RCPT ${to.code} ${to.text.replace(/\s+/g, " ")}` };
  } catch (err) {
    return { status: "unknown", detail: `${err.code || "ERROR"}: ${err.message}` };
  } finally {
    socket.destroy();
  }
}

async function probeRecipient(email, { mailFrom } = {}) {
  if (!PROBE_ENABLED) return { status: "unknown", detail: "probe disabled (RECIPIENT_PROBE=off)" };

  const rcpt = String(email || "").trim();
  const domain = rcpt.split("@")[1];
  const sender = mailFrom || process.env.EMAIL_USER || "postmaster@localhost";
  if (!domain) return { status: "unknown", detail: "no domain" };

  let hosts = [];
  try {
    const mx = await dns.promises.resolveMx(domain);
    hosts = (mx || []).sort((a, b) => a.priority - b.priority).map((m) => m.exchange);
  } catch (err) {
    return { status: "unknown", detail: `MX lookup failed: ${err.code || err.message}` };
  }
  if (hosts.length === 0) return { status: "unknown", detail: "no MX records" };

  let last = { status: "unknown", detail: "no attempt" };
  for (const host of hosts.slice(0, MAX_MX_TRIES)) {
    last = await probeHost(host, PROBE_PORT, { mailFrom: sender, rcpt, timeoutMs: PROBE_TIMEOUT_MS });
    last.host = host;
    // A definitive answer from any MX ends the search; otherwise try the next.
    if (last.status !== "unknown") return last;
  }
  return last;
}

module.exports = { probeRecipient, isMailboxNotFound };
