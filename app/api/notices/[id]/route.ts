import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateNoticeStore, deleteNoticeStore } from '@/lib/store';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const notice = await updateNoticeStore(id, body);
    return NextResponse.json({ notice });
  } catch {
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteNoticeStore(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
