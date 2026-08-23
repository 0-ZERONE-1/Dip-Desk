// ZERONE - Client-side persistent store helper for demo/mock mode on Vercel serverless environments

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
    (item: any) => item && item._id && !deleted.includes(String(item._id))
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

function itemMatchesDept(customItem: any, targetDeptSlug: string): boolean {
  if (!targetDeptSlug) return true;

  // ZERONE - Match items assigned to all departments
  if (customItem.departmentSlug === 'all' || customItem.departmentId === 'all') return true;
  if (typeof customItem.departmentId === 'object' && (customItem.departmentId?.slug === 'all' || customItem.departmentId?._id === 'all')) return true;

  const targetClean = targetDeptSlug.toLowerCase().trim();

  // ZERONE - Match by direct slug equality
  if (customItem.departmentSlug === targetDeptSlug || customItem.departmentSlug === targetClean) return true;
  if (typeof customItem.departmentId === 'object') {
    const dSlug = (customItem.departmentId?.slug || '').toLowerCase();
    const dName = (customItem.departmentId?.name || '').toLowerCase();
    if (dSlug === targetClean) return true;
    if (targetClean === 'cst' && (dName.includes('computer science') || dSlug.includes('computer-science'))) return true;
  }
  if (typeof customItem.subjectId === 'object') {
    const subDeptSlug = (customItem.subjectId?.departmentId?.slug || '').toLowerCase();
    const subDeptName = (customItem.subjectId?.departmentId?.name || '').toLowerCase();
    if (subDeptSlug === targetClean) return true;
    if (targetClean === 'cst' && (subDeptName.includes('computer science') || subDeptSlug.includes('computer-science'))) return true;
  }

  if (typeof customItem.departmentId === 'string') {
    const dStr = customItem.departmentId.toLowerCase();
    if (dStr === targetClean) return true;
    if (dStr.replace(/^dept_/, '') === targetClean) return true;

    // ZERONE - Check matching custom departments in localStorage
    const depts = getClientCustomItems<any>('departments');
    const matchedDept = depts.find((d) => d._id === customItem.departmentId || d.slug === customItem.departmentId);
    if (matchedDept) {
      const mSlug = (matchedDept.slug || '').toLowerCase();
      const mName = (matchedDept.name || '').toLowerCase();
      if (mSlug === targetClean) return true;
      if (targetClean === 'cst' && (mName.includes('computer science') || mSlug.includes('computer-science'))) return true;
    }
  }

  // If customItem has subjectId as a string or object, check matched subject's department
  if (customItem.subjectId) {
    const subIdStr = typeof customItem.subjectId === 'object' ? customItem.subjectId._id : customItem.subjectId;
    const subjects = getClientCustomItems<any>('subjects');
    const matchedSub = subjects.find((s) => s._id === subIdStr || s.slug === subIdStr);
    if (matchedSub) {
      return itemMatchesDept(matchedSub, targetDeptSlug);
    }
  }

  // If item explicitly has a department specified, and none matched targetDeptSlug, reject it!
  if (customItem.departmentSlug || customItem.departmentId) {
    return false;
  }

  return true;
}

function itemMatchesSemester(customItem: any, targetSem: number): boolean {
  if (!targetSem) return true;

  const sem = customItem.semesterNumber || customItem.subjectId?.semesterNumber;
  if (sem) {
    return Number(sem) === Number(targetSem);
  }

  if (customItem.subjectId) {
    const subIdStr = typeof customItem.subjectId === 'object' ? customItem.subjectId._id : customItem.subjectId;
    const subjects = getClientCustomItems<any>('subjects');
    const matchedSub = subjects.find((s) => s._id === subIdStr || s.slug === subIdStr);
    if (matchedSub && matchedSub.semesterNumber) {
      return Number(matchedSub.semesterNumber) === Number(targetSem);
    }
  }

  return true;
}

export function syncAndFilterItems<T = any>(
  category: string,
  serverItems: T[],
  filters?: { category?: string; subjectId?: string; departmentSlug?: string; semesterNumber?: number }
): T[] {
  if (typeof window === 'undefined') return serverItems || [];
  
  // If server returned items from API database, prioritize server items!
  const hasServerItems = Array.isArray(serverItems) && serverItems.length > 0;
  const rawList = Array.isArray(serverItems) ? [...serverItems] : [];

  const customList = getClientCustomItems<any>(category);
  const deletedIds = getClientDeletedIds();

  // Merge custom created/edited items into rawList if they aren't already covered by server API
  customList.forEach((customItem) => {
    if (deletedIds.includes(String(customItem._id))) return; // Skip locally deleted custom items
    const index = rawList.findIndex((item: any) => item._id === customItem._id || (item.slug && item.slug === customItem.slug));
    if (index !== -1) {
      rawList[index] = { ...rawList[index], ...customItem };
    } else if (!hasServerItems) {
      rawList.unshift(customItem);
    }
  });

  let filtered = rawList;

  if (filters) {
    filtered = filtered.filter((item: any) => {
      if (filters.category && item.category && item.category !== filters.category) return false;

      if (filters.subjectId) {
        const itemSubId = typeof item.subjectId === 'object'
          ? (item.subjectId?._id || item.subjectId?.slug)
          : item.subjectId;
        if (itemSubId && itemSubId !== filters.subjectId) return false;
      }

      if (filters.departmentSlug) {
        if (!itemMatchesDept(item, filters.departmentSlug)) return false;
      }

      if (filters.semesterNumber) {
        if (!itemMatchesSemester(item, filters.semesterNumber)) return false;
      }

      return true;
    });
  }

  return filtered;
}

export function clearAllClientStorage() {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('dipdesk_')) {
        localStorage.removeItem(key);
      }
    });
  } catch {}
}
