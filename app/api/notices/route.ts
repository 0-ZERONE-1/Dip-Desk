import { NextRequest, NextResponse } from 'next/server';
import { getNoticesStore, createNoticeStore } from '@/lib/store';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const notices = await getNoticesStore();
    return NextResponse.json({ notices }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const notice = await createNoticeStore(body);
    return NextResponse.json({ notice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}
