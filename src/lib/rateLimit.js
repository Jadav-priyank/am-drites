import { NextResponse } from 'next/server';

const rateLimitStore = new Map();

/**
 * Clean up expired keys periodically when store size grows
 */
function cleanupExpired() {
  const now = Date.now();
  if (rateLimitStore.size > 500) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Extract client IP from Next.js request headers
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

/**
 * Apply rate limit check. Returns a 429 NextResponse if limited, or null if permitted.
 * 
 * @param {Request} request Next.js request object
 * @param {Object} options Configuration options
 * @param {number} options.max Maximum allowed requests in window
 * @param {number} options.windowMs Time window in milliseconds
 * @param {string} options.prefix Key prefix for isolating different endpoints
 * @returns {NextResponse|null} 429 response if limited, null otherwise
 */
export function applyRateLimit(request, { max = 5, windowMs = 15 * 60 * 1000, prefix = 'auth' } = {}) {
  cleanupExpired();

  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return null;
  }

  record.count += 1;

  if (record.count > max) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    const minutes = Math.ceil(retryAfterSeconds / 60);

    return NextResponse.json(
      {
        error: `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
