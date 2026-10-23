// No database, no network: dns.promises.resolveMx is stubbed. Run: npm run test:mx
const test = require("node:test");
const assert = require("node:assert/strict");
const dns = require("dns");
const { checkEmailDomain, extractDomain } = require("../services/mxCheck");

const real = dns.promises.resolveMx;
const stub = (fn) => { dns.promises.resolveMx = fn; };
const dnsErr = (code) => Object.assign(new Error(`queryMx ${code}`), { code });
test.afterEach(() => { dns.promises.resolveMx = real; });

test("extractDomain lowercases the domain and rejects malformed input", () => {
  assert.equal(extractDomain("User@GMail.COM"), "gmail.com");
  for (const bad of ["", "nope", "a@", "@b.com", "a@b", "a b@c.com", "a@-bad-.com", null, undefined]) {
    assert.equal(extractDomain(bad), "", String(bad));
  }
});

test("bad format never touches DNS", async () => {
  let called = false;
  stub(async () => { called = true; return []; });
  assert.equal((await checkEmailDomain("not-an-email")).status, "bad_format");
  assert.equal(called, false);
});

test("MX records present -> valid", async () => {
  stub(async (d) => { assert.equal(d, "gmail.com"); return [{ exchange: "gmail-smtp-in.l.google.com", priority: 5 }]; });
  const r = await checkEmailDomain("someone@Gmail.com");
  assert.equal(r.status, "valid");
  assert.equal(r.domain, "gmail.com");
});

test("NXDOMAIN / no MX data / empty list / null MX -> invalid", async () => {
  for (const impl of [
    async () => { throw dnsErr("ENOTFOUND"); },
    async () => { throw dnsErr("ENODATA"); },
    async () => [],
    async () => [{ exchange: ".", priority: 0 }],
  ]) {
    stub(impl);
    assert.equal((await checkEmailDomain("a@example.invalid")).status, "invalid");
  }
});

test("SERVFAIL / refused / network / timeout -> temporary_error, never invalid", async () => {
  for (const code of ["ESERVFAIL", "ECONNREFUSED", "EAI_AGAIN", "ETIMEOUT", "ETIMEDOUT"]) {
    stub(async () => { throw dnsErr(code); });
    const r = await checkEmailDomain("a@example.com");
    assert.equal(r.status, "temporary_error", code);
  }
  stub(async () => { throw new Error("weird"); });
  assert.equal((await checkEmailDomain("a@example.com")).status, "temporary_error");
});

test("a hanging DNS lookup times out instead of hanging forever", async () => {
  stub(() => new Promise(() => {}));
  const started = Date.now();
  const r = await checkEmailDomain("a@example.com", { timeoutMs: 50 });
  assert.equal(r.status, "temporary_error");
  assert.ok(Date.now() - started < 1000);
});
