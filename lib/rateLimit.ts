/**
 * Simple in-memory rate limiter for API routes.
 * Uses per-IP tracking with sliding window.
 *
 * NOTE: In a multi-instance / serverless deployment each instance has its own
 * map, so the limit is per-instance.  For stronger protection deploy a Redis
 * adapter or a WAF in front of Vercel.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

export interface RateLimitOptions {
  /** Unique name for this limiter (e.g. 'login', 'register') */
  name: string;
  /** Maximum requests allowed within the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Returns `true` if the request is allowed, `false` if it should be blocked.
 */
export function checkRateLimit(ip: string, options: RateLimitOptions): boolean {
  const { name, max, windowMs } = options;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= max) {
    return false; // blocked
  }

  entry.count += 1;
  return true; // allowed
}

/**
 * Extract the real client IP from common Next.js request headers.
 */
export function getClientIp(req: Request | { headers: Headers }): string {
  const headers = req instanceof Request ? req.headers : req.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
