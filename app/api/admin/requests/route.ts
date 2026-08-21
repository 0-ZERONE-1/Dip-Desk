import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import { getRequestsStore, updateRequestStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const requests = await getRequestsStore();
    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id, status, adminNote } = await req.json();
    const updated = await updateRequestStore(id, { status, adminNote });
    return NextResponse.json({ request: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
