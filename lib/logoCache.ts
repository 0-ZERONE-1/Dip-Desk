// Persistent logo cache for instant 0ms pre-loading without flash

const LOGO_CACHE_KEY = 'dipdesk_custom_logo_cache';
let memoryCachedLogo: string | null = null;

export function getCachedCustomLogo(): string {
  if (memoryCachedLogo !== null) return memoryCachedLogo;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOGO_CACHE_KEY);
      if (stored !== null) {
        memoryCachedLogo = stored;
        return stored;
      }
    } catch {}
  }
  return '';
}

export function setCachedCustomLogo(url: string) {
  memoryCachedLogo = url || '';
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOGO_CACHE_KEY, url || '');
    } catch {}
  }
}
