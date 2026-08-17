// Simple in-memory, per-key sliding-window rate limiter factory.
// No external dependency: tracks request timestamps in memory. Resets on
// server restart and does not share state across multiple server instances
// — a deliberate tradeoff for a small app, not meant to replace a real
// distributed limiter (e.g. Redis-backed) at production scale.

function createRateLimiter({ windowMs, max, message, keyFn }) {
  const requestLog = new Map();
  const getKey = keyFn || ((req) => req.ip || "unknown");

  return (req, res, next) => {
    const key = getKey(req);
    const now = Date.now();

    const recent = (requestLog.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      return res.status(429).json({ message });
    }

    recent.push(now);
    requestLog.set(key, recent);

    next();
  };
}

module.exports = createRateLimiter;
