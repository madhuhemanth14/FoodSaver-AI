// Small in-memory per-IP limiter (no extra dependency). It complements the
// per-email cooldown/hourly cap stored in MongoDB by otpService. State is
// per server process; if you later run several instances behind a load
// balancer, swap this for a shared-store limiter such as express-rate-limit
// with a Redis store.
function rateLimit({ windowMs, max, message }) {
  const hits = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs);
  timer.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: message || "Too many requests. Please try again later.",
        retryAfterSeconds,
      });
    }
    next();
  };
}

module.exports = rateLimit;
