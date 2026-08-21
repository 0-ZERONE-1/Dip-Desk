import { NextRequest, NextResponse } from 'next/server';
import { getDevelopersStore, createDeveloperStore } from '@/lib/store';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get('all') === 'true';

  try {
    const developers = await getDevelopersStore(includeInactive);
    return NextResponse.json({ developers }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch developers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body.name || !body.role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const dev = await createDeveloperStore(body);
    return NextResponse.json({ developer: dev }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create developer profile' }, { status: 500 });
  }
}
