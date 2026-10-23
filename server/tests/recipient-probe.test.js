// Tests for services/recipientCheck.js against a tiny fake MX server (no
// database, no internet):   node --test tests/recipient-probe.test.js
process.env.RECIPIENT_PROBE_TIMEOUT_MS = "1500";
const net = require("net");
const dns = require("dns");
const test = require("node:test");
const assert = require("node:assert/strict");

// Fake MX: answers RCPT TO according to `rcptReply(address)`.
function fakeMx(rcptReply, { silent = false } = {}) {
  const server = net.createServer((sock) => {
    if (silent) return; // accepts TCP, never sends the 220 greeting
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
        else if (/^RCPT TO:<(.*)>/i.test(line)) sock.write(rcptReply(line.match(/<(.*)>/)[1]) + "\r\n");
        else if (/^QUIT/i.test(line)) sock.end("221 bye\r\n");
        else sock.write("502 unexpected\r\n");
      }
    });
    sock.on("error", () => {});
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

async function probe(server, email) {
  process.env.RECIPIENT_PROBE_PORT = String(server ? server.address().port : 1);
  delete require.cache[require.resolve("../services/recipientCheck")];
  dns.promises.resolveMx = async () => [{ exchange: "127.0.0.1", priority: 1 }];
  const { probeRecipient } = require("../services/recipientCheck");
  return probeRecipient(email, { mailFrom: "hello@foodsaver.test" });
}

test("mailbox accepted by its own MX -> exists", async () => {
  const s = await fakeMx(() => "250 2.1.5 OK");
  assert.equal((await probe(s, "dasarisowmyasrinivas@gmail.com")).status, "exists");
  s.close();
});

test("550 5.1.1 'account does not exist' from the MX -> not_found (example@gmail.com case)", async () => {
  const s = await fakeMx((a) => (a === "example@gmail.com" ? "550-5.1.1 The email account that you tried to reach does not exist.\r\n550 5.1.1 Please try double-checking the recipient's email address" : "250 OK"));
  const bad = await probe(s, "example@gmail.com");
  assert.equal(bad.status, "not_found", JSON.stringify(bad));
  assert.equal((await probe(s, "real.person@gmail.com")).status, "exists");
  s.close();
});

test("policy / reputation rejections (5.7.x) are NOT proof the mailbox is missing", async () => {
  const s = await fakeMx(() => "550 5.7.1 Service unavailable; client host blocked using Spamhaus");
  assert.equal((await probe(s, "real.person@gmail.com")).status, "unknown");
  s.close();
});

test("greylisting / temporary 4xx is inconclusive", async () => {
  const s = await fakeMx(() => "451 4.7.1 Greylisted, try again later");
  assert.equal((await probe(s, "real.person@gmail.com")).status, "unknown");
  s.close();
});

test("blocked/refused port 25 is inconclusive (never 'doesn't exist')", async () => {
  const tmp = net.createServer();
  await new Promise((r) => tmp.listen(0, "127.0.0.1", r));
  const port = tmp.address().port;
  await new Promise((r) => tmp.close(r)); // now nothing listens on `port`
  process.env.RECIPIENT_PROBE_PORT = String(port);
  delete require.cache[require.resolve("../services/recipientCheck")];
  dns.promises.resolveMx = async () => [{ exchange: "127.0.0.1", priority: 1 }];
  const r = await require("../services/recipientCheck").probeRecipient("real.person@gmail.com", { mailFrom: "hello@foodsaver.test" });
  assert.equal(r.status, "unknown");
});

test("server that never greets (timeout) is inconclusive", async () => {
  const s = await fakeMx(() => "250 OK", { silent: true });
  assert.equal((await probe(s, "real.person@gmail.com")).status, "unknown");
  s.close();
});

test("MX lookup failure is inconclusive", async () => {
  delete require.cache[require.resolve("../services/recipientCheck")];
  dns.promises.resolveMx = async () => { const e = new Error("x"); e.code = "ENOTFOUND"; throw e; };
  const r = await require("../services/recipientCheck").probeRecipient("a@b.example", { mailFrom: "x@y.test" });
  assert.equal(r.status, "unknown");
});
