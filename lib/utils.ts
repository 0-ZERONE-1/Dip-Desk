import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  if (typeof window !== 'undefined') {
    try {
      const customDepts = JSON.parse(localStorage.getItem('dipdesk_custom_departments') || '[]');
      const found = customDepts.find((d: any) => d.slug === slug || d.slug === normalized);
      if (found && found.name) return found.name;
    } catch {}
  }
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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

  // 1. ImgBB webpage link (e.g. https://ibb.co/LwJPHkw)
  if (trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  // 2. Google Drive links (e.g. drive.google.com/file/d/1A2B3C.../view or drive.google.com/open?id=1A2B3C...)
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w1000`;
    }
  }

  // 3. Dropbox links (e.g. www.dropbox.com/s/.../file.png?dl=0)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }

  // 4. Imgur links (e.g. i.imgur.com/xyz.png or imgur.com/xyz)
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

  // 5. PostImages webpage links (e.g. postimg.cc/xxx)
  if (trimmed.includes('postimg.cc/') && !trimmed.includes('i.postimg.cc/')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  // 6. GitHub Blob / Raw / Permalink handling (e.g. github.com/0-ZERONE-1/Assets_01/blob/main/image.png)
  if (trimmed.includes('github.com/')) {
    if (trimmed.includes('/blob/')) {
      return trimmed.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    if (trimmed.includes('/raw/')) {
      return trimmed.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
    }
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
