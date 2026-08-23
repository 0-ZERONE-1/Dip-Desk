import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { updateUserStore } from '@/lib/store';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (typeof body.isBanned === 'boolean') {
      updateData.isBanned = body.isBanned;
    }
    if ('bannedUntil' in body) {
      updateData.bannedUntil = body.bannedUntil;
    }

    const updatedUser = await updateUserStore(id, updateData);
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    console.error('Failed to update user ban status:', err);
    return NextResponse.json({ error: 'Failed to update user ban status' }, { status: 500 });
  }
}
