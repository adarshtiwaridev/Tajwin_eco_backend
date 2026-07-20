import { LRUCache } from 'lru-cache';
import { sendError } from '#utils/apiResponse.js';
import logger from '#config/logger.js';

// Simple In-Memory Rate Limiter (Note: For multi-server/serverless deployment, use Redis (e.g., Upstash))
const rateLimitCache = new LRUCache({
  max: 500, // Maximum number of IPs to track
  ttl: 15 * 60 * 1000, // 15 minutes
});

/**
 * Rate Limiter Middleware for Next.js App Router
 * @param {number} limit - Maximum requests allowed per IP within the TTL
 */
export const rateLimiter = (limit = 100) => {
  return async (req) => {
    // In Next.js, getting IP can be tricky. Look at x-forwarded-for or fallback.
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const tokenCount = rateLimitCache.get(ip) || 0;

    if (tokenCount >= limit) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return sendError('Too many requests, please try again later.', 429);
    }

    rateLimitCache.set(ip, tokenCount + 1);
    return null; // Null means continue
  };
};

/**
 * Apply security headers to response (Equivalent to Helmet for Next.js API Routes)
 * @param {Response} response 
 */
export const applySecurityHeaders = (response) => {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  // Add CORS headers if needed for external panels
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};
