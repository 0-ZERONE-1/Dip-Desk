import { NextRequest, NextResponse } from 'next/server';
import { getDepartmentsStore, createDepartmentStore } from '@/lib/store';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const includeInactive = req.nextUrl.searchParams.get('all') === 'true';
    const departments = await getDepartmentsStore(includeInactive);
    return NextResponse.json({ departments }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const dept = await createDepartmentStore(body);
    return NextResponse.json({ department: dept }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
