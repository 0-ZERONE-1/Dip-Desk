// Client-side persistent store helper for demo/mock mode on Vercel serverless environments

const DELETED_KEY = 'dipdesk_deleted_ids';
const CUSTOM_PREFIX = 'dipdesk_custom_';

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

export function saveClientCustomItem(category: string, item: any) {
  if (typeof window === 'undefined' || !category || !item || !item._id) return;
  try {
    const key = CUSTOM_PREFIX + category;
    const existing: any[] = getClientCustomItems(category);
    const index = existing.findIndex((i) => i._id === item._id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...item };
    } else {
      existing.unshift(item);
    }
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

export function getClientCustomItems<T = any>(category: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = CUSTOM_PREFIX + category;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function syncAndFilterItems<T = any>(
  category: string,
  serverItems: T[],
  filters?: { category?: string; subjectId?: string; departmentSlug?: string; semesterNumber?: number }
): T[] {
  if (typeof window === 'undefined') return serverItems || [];
  const rawList = Array.isArray(serverItems) ? [...serverItems] : [];
  const customList = getClientCustomItems<any>(category);

  // Merge custom created/edited items into rawList if they match active filters
  customList.forEach((customItem) => {
    if (filters) {
      if (filters.category && customItem.category && customItem.category !== filters.category) return;
      if (filters.subjectId) {
        const itemSubId = typeof customItem.subjectId === 'object'
          ? (customItem.subjectId?._id || customItem.subjectId?.slug)
          : customItem.subjectId;
        if (itemSubId && itemSubId !== filters.subjectId) return;
      }
      if (filters.departmentSlug) {
        let itemDeptSlug = customItem.departmentSlug;
        if (!itemDeptSlug && typeof customItem.departmentId === 'object') {
          itemDeptSlug = customItem.departmentId?.slug;
        }
        if (!itemDeptSlug && typeof customItem.subjectId === 'object') {
          itemDeptSlug = customItem.subjectId?.departmentId?.slug;
        }
        if (!itemDeptSlug && typeof customItem.departmentId === 'string') {
          itemDeptSlug = customItem.departmentId.replace(/^dept_/, '');
        }
        if (itemDeptSlug && itemDeptSlug !== filters.departmentSlug) return;
      }
      if (filters.semesterNumber) {
        const itemSem = customItem.semesterNumber || customItem.subjectId?.semesterNumber;
        if (itemSem && Number(itemSem) !== Number(filters.semesterNumber)) return;
      }
    }

    const index = rawList.findIndex((item: any) => item._id === customItem._id);
    if (index !== -1) {
      rawList[index] = { ...rawList[index], ...customItem };
    } else {
      rawList.unshift(customItem);
    }
  });

  return filterClientDeleted(rawList);
}
