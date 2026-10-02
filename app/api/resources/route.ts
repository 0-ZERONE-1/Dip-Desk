import { NextRequest, NextResponse } from 'next/server';
import { getResourcesStore, createResourceStore } from '@/lib/store';
import { requireAdmin } from '@/lib/requireAdmin';
import { sanitizeString, validateUrl } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const category = searchParams.get('category');
  const departmentSlug = searchParams.get('departmentSlug') || searchParams.get('departmentId');
  const semester = searchParams.get('semester') || searchParams.get('semesterNumber');

  try {
    const resources = await getResourcesStore(
      category || undefined,
      subjectId || undefined,
      departmentSlug || undefined,
      semester ? Number(semester) : undefined
    );
    return NextResponse.json({ resources }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, url, category, subjectId, description, departmentId, semesterNumber } = body;

    if (!title || !url || !category) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 });
    }

    // ZERONE - Sanitize text input fields
    const cleanTitle    = sanitizeString(title, 300);
    const cleanCategory = sanitizeString(category, 100);
    const cleanDesc     = description ? sanitizeString(description, 2000) : '';
    const cleanSubject  = (subjectId && subjectId !== 'COMMON') ? sanitizeString(subjectId, 100) : null;

    // ZERONE - Validate URL to prevent SSRF and malicious protocol schemes
    const cleanUrl = validateUrl(url);
    if (!cleanUrl) {
      return NextResponse.json({ error: 'Invalid or disallowed resource URL provided' }, { status: 400 });
    }

    const cleanDept = (departmentId && departmentId !== 'all') ? departmentId : null;
    const cleanSem = (semesterNumber && semesterNumber !== 'all') ? Number(semesterNumber) : null;

    const resource = await createResourceStore({
      ...body,
      title: cleanTitle,
      url: cleanUrl,
      category: cleanCategory,
      subjectId: cleanSubject,
      description: cleanDesc,
      departmentId: cleanDept,
      semesterNumber: cleanSem,
    });
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
