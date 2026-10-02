import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRawImageUrl(url: string): string {
  if (!url) return '';
  return url.trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const KNOWN_DEPARTMENTS: Record<string, string> = {
  cst: 'Computer Science & Technology',
  cse: 'Computer Science & Engineering',
  ce: 'Civil Engineering',
  civil: 'Civil Engineering',
  me: 'Mechanical Engineering',
  mechanical: 'Mechanical Engineering',
  ee: 'Electrical Engineering',
  electrical: 'Electrical Engineering',
  etce: 'Electronics & Telecommunication Engineering',
  ece: 'Electronics & Communication Engineering',
  se: 'Survey Engineering',
  survey: 'Survey Engineering',
  architecture: 'Architecture Engineering',
  automobile: 'Automobile Engineering',
  chemical: 'Chemical Engineering',
  mining: 'Mining Engineering',
  it: 'Information Technology',
};

export function getDepartmentNameBySlug(slug: string): string {
  if (!slug) return '';
  const normalized = slug.toLowerCase().trim();
  if (KNOWN_DEPARTMENTS[normalized]) {
    return KNOWN_DEPARTMENTS[normalized];
  }
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function findDepartmentBySlug<T extends { _id?: string; name?: string; slug?: string; description?: string; icon?: string }>(
  departments: T[],
  slugOrName: string
): T | null {
  if (!slugOrName) return null;
  const target = slugOrName.toLowerCase().trim();
  if (target === 'all' || target === 'browse' || target === 'departments') return null;

  let found = departments.find(
    (d) => d.slug?.toLowerCase() === target || d._id?.toLowerCase() === target
  );
  if (found) return found;

  const targetSlug = slugify(target);
  found = departments.find(
    (d) => slugify(d.slug || '') === targetSlug || slugify(d.name || '') === targetSlug
  );
  if (found) return found;

  const aliasName = KNOWN_DEPARTMENTS[target]?.toLowerCase();
  if (aliasName) {
    found = departments.find(
      (d) => (d.name && d.name.toLowerCase().includes(aliasName)) || (d.name && aliasName.includes(d.name.toLowerCase()))
    );
    if (found) return found;
  }

  for (const [key, fullName] of Object.entries(KNOWN_DEPARTMENTS)) {
    if (target === key || targetSlug === slugify(fullName) || target === slugify(key)) {
      found = departments.find((d) => {
        const dSlug = slugify(d.slug || '');
        const dName = slugify(d.name || '');
        return dSlug === key || dSlug === slugify(fullName) || dName === slugify(fullName);
      });
      if (found) return found;
    }
  }

  if (KNOWN_DEPARTMENTS[target]) {
    return {
      _id: target,
      name: KNOWN_DEPARTMENTS[target],
      slug: target,
      description: 'Select a semester to access syllabus, notes, model papers, and lab manuals.',
      icon: '',
    } as unknown as T;
  }

  return null;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Syllabus: '📑',
    Notes: '📝',
    Books: '📚',
    'Model Question Papers': '📋',
    'Lab Manuals': '🔬',
  };
  return icons[category] || '📄';
}

export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    Syllabus: 'bg-rose-50 text-rose-700 border-rose-200',
    Notes: 'bg-blue-50 text-blue-700 border-blue-200',
    Books: 'bg-violet-50 text-violet-700 border-violet-200',
    'Model Question Papers': 'bg-amber-50 text-amber-700 border-amber-200',
    'Lab Manuals': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export function formatImageUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();

  // ZERONE - ImgBB webpage link proxying
  if (trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  // ZERONE - Google Drive direct link transformation
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w1000`;
    }
  }

  // ZERONE - Dropbox direct link transformation
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }

  // ZERONE - Imgur link format normalization
  if (trimmed.includes('i.imgur.com/')) {
    return trimmed;
  }
  if (trimmed.includes('imgur.com/')) {
    const hashMatch = trimmed.match(/#([a-zA-Z0-9]{5,})/);
    if (hashMatch && hashMatch[1]) {
      return `https://i.imgur.com/${hashMatch[1]}.png`;
    }
    const cleanUrl = trimmed.split('#')[0].split('?')[0];
    const parts = cleanUrl.split(/[/_-]/).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (
        /^[a-zA-Z0-9]{5,10}$/.test(p) &&
        !['gallery', 'imgur', 'com', 'http', 'https', 'a'].includes(p.toLowerCase())
      ) {
        return `https://i.imgur.com/${p}.png`;
      }
    }
  }

  // ZERONE - PostImages webpage link proxying
  if (trimmed.includes('postimg.cc/') && !trimmed.includes('i.postimg.cc/')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

export function isImageUrl(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:')
  );
}

export const CATEGORIES = ['Syllabus', 'Notes', 'Books', 'Model Question Papers', 'Lab Manuals'] as const;
export const SEMESTERS = [1, 2, 3, 4, 5, 6] as const;
