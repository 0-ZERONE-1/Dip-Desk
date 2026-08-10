// Client-side persistent store helper for demo/mock mode on Vercel serverless environments

const DELETED_KEY = 'dipdesk_deleted_ids';

export function getClientDeletedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addClientDeletedId(id: string) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const deleted = getClientDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }
  } catch {}
}

export function filterClientDeleted<T = any>(items: T[]): T[] {
  if (typeof window === 'undefined' || !Array.isArray(items)) return items || [];
  const deleted = getClientDeletedIds();
  if (deleted.length === 0) return items;
  return items.filter(
    (item: any) => item && item._id && !deleted.includes(String(item._id)) && (!item.slug || !deleted.includes(String(item.slug)))
  );
}
