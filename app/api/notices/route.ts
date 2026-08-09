import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNoticesStore, createNoticeStore } from '@/lib/store';

export async function GET() {
  try {
    const notices = await getNoticesStore();
    return NextResponse.json({ notices });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
