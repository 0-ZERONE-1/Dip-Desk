/**
 * ZERONE - In-memory sliding window rate limiter for API routes
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

export interface RateLimitOptions {
  name: string;
  max: number;
  windowMs: number;
}

/**
 * ZERONE - Checks if request key exceeds maximum allowed count within specified time window
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
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * ZERONE - Extracts client IP address from incoming Next.js request headers
 */
export function getClientIp(req: Request | { headers: Headers }): string {
  const headers = req instanceof Request ? req.headers : req.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}


