import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { getUsersStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const users = await getUsersStore();
    return NextResponse.json({ users: users || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
