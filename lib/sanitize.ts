/**
 * ZERONE - Server-side input sanitization utilities
 */

// ZERONE - Dangerous NoSQL injection characters & null byte patterns
const NOSQL_PATTERN = /[\$\{\}]/g;
const NULL_BYTE_PATTERN = /\x00/g;

/**
 * ZERONE - Sanitizes plain text input by stripping NoSQL operators & null bytes
 */
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (value === null || value === undefined) return '';
  const str = String(value)
    .replace(NULL_BYTE_PATTERN, '')
    .replace(NOSQL_PATTERN, '')
    .trim()
    .slice(0, maxLen);
  return str;
}

/**
 * ZERONE - Validates HTTP/HTTPS URLs and blocks private/local network addresses (SSRF guard)
 */
export function validateUrl(value: unknown): string | null {
  if (!value) return null;
  const raw = String(value).trim();

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null; // ZERONE - Reject javascript:, data:, file: protocols
  }

  const host = parsed.hostname.toLowerCase();
  const isPrivate =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host);

  if (isPrivate) return null;

  return raw.slice(0, 2048); // ZERONE - Cap maximum URL length
}

/**
 * ZERONE - Validates email format using standard RFC 5322 pattern
 */
export function validateEmail(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).toLowerCase().trim();
  const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_PATTERN.test(str) ? str : null;
}

