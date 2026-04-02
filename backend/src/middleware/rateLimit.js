const { sendError } = require("../utils/response");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimiter({ key, maxRequests, windowMs }) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const ip = getClientIp(req);
    const bucketKey = `${key}:${ip}`;

    const current = buckets.get(bucketKey);
    if (!current || current.expiresAt <= now) {
      buckets.set(bucketKey, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSec = Math.ceil((current.expiresAt - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(retryAfterSec, 1)));
      return sendError(
        res,
        429,
        "RATE_LIMITED",
        "Too many requests, please try again later",
      );
    }

    current.count += 1;
    buckets.set(bucketKey, current);
    return next();
  };
}

module.exports = {
  createRateLimiter,
};
