import { NextRequest, NextResponse } from 'next/server';
import { updateSubjectStore, deleteSubjectStore } from '@/lib/store';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const subject = await updateSubjectStore(id, body);
    return NextResponse.json({ subject });
  } catch {
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteSubjectStore(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
