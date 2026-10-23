// Mailbox check before OTP. No database, no internet, no real port 25:
// a local fake MX answers RCPT TO and dns.promises.resolveMx is stubbed.
//   npm run test:mailbox
process.env.RECIPIENT_PROBE_TIMEOUT_MS = "1500";
process.env.JWT_SECRET = "test-secret";
process.env.EMAIL_USER = "hello@foodsaver.test";
process.env.NODE_ENV = "test";

const net = require("net");
const dns = require("dns");
const test = require("node:test");
const assert = require("node:assert/strict");

// Fake MX. Behaviour by local part:
//   real@      -> 250 accepted
//   missing@   -> 550 5.1.1 no such mailbox (definitive)
//   grey@      -> 451 greylisted (temporary)
//   blocked@   -> 550 5.7.1 policy block (refuses to reveal mailbox)
function fakeMx() {
  const rcpts = [];
  const server = net.createServer((sock) => {
    let buf = "";
    sock.write("220 mx.fake ESMTP\r\n");
    sock.on("data", (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf("\r\n")) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (/^EHLO/i.test(line)) sock.write("250-mx.fake\r\n250 8BITMIME\r\n");
        else if (/^MAIL FROM/i.test(line)) sock.write("250 2.1.0 OK\r\n");
        else if (/^RCPT TO:<(.*)>/i.test(line)) {
          const a = line.match(/<(.*)>/)[1];
          rcpts.push(a);
          const local = a.split("@")[0];
          if (local === "missing") sock.write("550-5.1.1 The email account that you tried to reach does not exist.\r\n550 5.1.1 Please try double-checking the recipient's email address\r\n");
          else if (local === "grey") sock.write("451 4.7.1 Greylisted, try again later\r\n");
          else if (local === "blocked") sock.write("550 5.7.1 Service unavailable; client host blocked\r\n");
          else sock.write("250 2.1.5 OK\r\n");
        } else if (/^DATA/i.test(line)) sock.write("354 go\r\n"); // must never happen
        else if (/^QUIT/i.test(line)) sock.end("221 bye\r\n");
        else sock.write("502 unexpected\r\n");
      }
    });
    sock.on("error", () => {});
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ server, rcpts })));
}

const dnsErr = (code) => Object.assign(new Error(`queryMx ${code}`), { code });
const realResolveMx = dns.promises.resolveMx;
dns.promises.resolveMx = async (domain) => {
  if (domain === "nomail.test") throw dnsErr("ENOTFOUND");
  if (domain === "nullmx.test") return [{ exchange: ".", priority: 0 }];
  if (domain === "flaky.test") throw dnsErr("ESERVFAIL");
  return [{ exchange: "127.0.0.1", priority: 1 }];
};

let mx;
let checkMailbox;
let controller;
const calls = { issueOtp: 0, sendTemplated: 0, findOne: 0 };

test.before(async () => {
  mx = await fakeMx();
  process.env.RECIPIENT_PROBE_PORT = String(mx.server.address().port);
  ({ checkMailbox } = require("../services/emailMailboxCheck"));

  // Stub only the outside world (Mongo lookup, OTP storage, the Gmail send).
  const User = require("../models/User");
  User.findOne = async () => { calls.findOne++; return null; };
  const otp = require("../services/otpService");
  otp.issueOtp = async () => { calls.issueOtp++; return { ok: true, otp: "123456", previous: null }; };
  otp.rollbackOtp = async () => {};
  const sendEmail = require("../services/emailService");
  sendEmail.sendTemplated = async () => { calls.sendTemplated++; return { success: true, accepted: ["x"], smtpResponse: "250 OK" }; };
  controller = require("../controllers/authController");
});

test.after(() => {
  mx.server.close();
  dns.promises.resolveMx = realResolveMx;
});

test.beforeEach(() => { calls.issueOtp = 0; calls.sendTemplated = 0; mx.rcpts.length = 0; });

function call(handler, email) {
  return new Promise(async (resolve) => {
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(b) { resolve({ status: this.statusCode, body: b }); },
    };
    await handler({ body: { email } }, res);
  });
}

// ---- service ---------------------------------------------------------------

test("service: accepted recipient -> safe", async () => {
  assert.equal((await checkMailbox("real@gmail.test")).status, "safe");
});

test("service: definitive 550 5.1.1 -> not_safe", async () => {
  assert.equal((await checkMailbox("missing@gmail.test")).status, "not_safe");
});

test("service: domain without MX / NXDOMAIN / null MX -> not_safe", async () => {
  assert.equal((await checkMailbox("a@nomail.test")).status, "not_safe");
  assert.equal((await checkMailbox("a@nullmx.test")).status, "not_safe");
});

test("service: greylist, policy block, DNS failure -> unknown (never not_safe)", async () => {
  assert.equal((await checkMailbox("grey@gmail.test")).status, "unknown");
  assert.equal((await checkMailbox("blocked@gmail.test")).status, "unknown");
  assert.equal((await checkMailbox("a@flaky.test")).status, "unknown");
});

test("service: no message is ever sent (no DATA command reaches the MX)", async () => {
  await checkMailbox("real@gmail.test");
  assert.deepEqual(mx.rcpts, ["real@gmail.test"]);
});

// ---- Verify click (verifyRegistrationEmail) ----------------------------------

test("1. SAFE -> existing OTP is generated and sent, 200 'OTP sent successfully' (box opens)", async () => {
  const r = await call(controller.verifyRegistrationEmail, "real@gmail.test");
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.equal(r.body.message, "OTP sent successfully");
  assert.equal(calls.issueOtp, 1);
  assert.equal(calls.sendTemplated, 1);
});

test("2. NOT_SAFE -> no OTP, exact 'doesn't exist' message, box stays closed", async () => {
  for (const email of ["missing@gmail.test", "a@nomail.test"]) {
    const r = await call(controller.verifyRegistrationEmail, email);
    assert.equal(r.status, 422, email);
    assert.equal(r.body.success, false);
    assert.equal(r.body.code, "EMAIL_UNVERIFIED");
    assert.equal(r.body.message, "Email doesn't exist. Please enter a correct email address.");
  }
  assert.equal(calls.issueOtp, 0);
  assert.equal(calls.sendTemplated, 0);
});

test("3. UNKNOWN -> no OTP, exact 'couldn't verify' message, never 'doesn't exist'", async () => {
  for (const email of ["grey@gmail.test", "blocked@gmail.test", "a@flaky.test"]) {
    const r = await call(controller.verifyRegistrationEmail, email);
    assert.equal(r.status, 503, email);
    assert.equal(r.body.success, false);
    assert.equal(r.body.code, "EMAIL_CHECK_UNKNOWN");
    assert.equal(r.body.message, "We couldn't verify this email right now. Please try again.");
    assert.doesNotMatch(r.body.message, /doesn't exist/);
  }
  assert.equal(calls.issueOtp, 0);
  assert.equal(calls.sendTemplated, 0);
});

test("3b. UNKNOWN when nothing listens on port 25 (blocked/refused)", async () => {
  const saved = process.env.RECIPIENT_PROBE_PORT;
  const tmp = net.createServer();
  await new Promise((r) => tmp.listen(0, "127.0.0.1", r));
  const closedPort = tmp.address().port;
  await new Promise((r) => tmp.close(r));
  // recipientCheck reads the port at load time, so load a fresh copy chain.
  process.env.RECIPIENT_PROBE_PORT = String(closedPort);
  for (const m of ["../services/recipientCheck", "../services/emailMailboxCheck"]) delete require.cache[require.resolve(m)];
  const fresh = require("../services/emailMailboxCheck");
  assert.equal((await fresh.checkMailbox("real@gmail.test")).status, "unknown");
  process.env.RECIPIENT_PROBE_PORT = saved;
});

test("4. invalid syntax -> existing validation error, no OTP, no network", async () => {
  for (const email of ["", "nope", "a@b", "a b@c.com"]) {
    const r = await call(controller.verifyRegistrationEmail, email);
    assert.equal(r.status, 400, JSON.stringify(email));
    assert.equal(r.body.message, "Please enter a valid email address.");
  }
  assert.equal(mx.rcpts.length, 0);
  assert.equal(calls.issueOtp, 0);
});

// ---- untouched flows -----------------------------------------------------------

test("5. Resend OTP (POST /register/send-otp handler) is unchanged and still works", async () => {
  const r = await call(controller.sendRegistrationOtp, "real@gmail.test");
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.equal(calls.issueOtp, 1);
  assert.equal(calls.sendTemplated, 1);
});
