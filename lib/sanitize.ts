/**
 * Server-side input sanitization utilities.
 * Import these in any API route that accepts user-supplied text.
 */

// Characters / patterns that are dangerous in MongoDB queries
const NOSQL_PATTERN = /[\$\{\}]/g;
// Null bytes
const NULL_BYTE_PATTERN = /\x00/g;

/**
 * Sanitise a plain text string:
 *  - Strips MongoDB operator characters ($, {, })
 *  - Strips null bytes
 *  - Trims whitespace
 *  - Enforces a maximum length (truncates, does NOT throw)
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
 * Validates that a URL:
 *  - Has a valid format
 *  - Uses http: or https: protocol only
 *  - Does NOT point to a private / local network address
 *
 * Returns the cleaned URL string on success, or `null` on failure.
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
    return null; // reject javascript:, data:, file:, etc.
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

  return raw.slice(0, 2048); // cap URL length
}

/**
 * Validates a basic email format.
 * Returns the lowercased email on success, or null on failure.
 */
export function validateEmail(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).toLowerCase().trim();
  // RFC 5322 simplified pattern
  const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_PATTERN.test(str) ? str : null;
}
