import { NextRequest, NextResponse } from 'next/server';
import { getResourcesStore, createResourceStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const category = searchParams.get('category');

  try {
    const resources = await getResourcesStore(category || undefined, subjectId || undefined);
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
  try {
    const body = await req.json();
    const { title, url, category, subjectId } = body;

    if (!title || !url || !category || !subjectId) {
      return NextResponse.json({ error: 'Title, URL, category, and subject are required' }, { status: 400 });
    }

    const resource = await createResourceStore(body);
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
