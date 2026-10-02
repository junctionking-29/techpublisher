/**
 * In-memory sliding window rate limiter (8 requests per minute per IP).
 * 
 * PRODUCTION UPGRADE NOTE:
 * For multi-instance, serverless (Vercel Edge/Serverless), or distributed deployments,
 * replace this in-memory Map with an atomic distributed store such as Redis or Upstash:
 *   e.g. `@upstash/ratelimit` paired with `@upstash/redis`.
 * This prevents reset-on-cold-start and ensures limits are synchronized across all regions.
 */

const ipRequests = new Map();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequests.entries()) {
      if (now > record.resetTime) {
        ipRequests.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Check if the request exceeds rate limits.
 * @param {Request} req - Next.js Request object
 * @param {number} limit - Max requests per window (default 8)
 * @param {number} windowMs - Window duration in ms (default 60000ms = 1 minute)
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(req, limit = 8, windowMs = 60 * 1000) {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || realIp || '127.0.0.1';

  const now = Date.now();
  const clientRecord = ipRequests.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    ipRequests.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (clientRecord.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: clientRecord.resetTime };
  }

  clientRecord.count += 1;
  return { allowed: true, remaining: limit - clientRecord.count, resetTime: clientRecord.resetTime };
}
