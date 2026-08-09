import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDevelopersStore, createDeveloperStore } from '@/lib/store';

export async function GET() {
  try {
    const developers = await getDevelopersStore();
    return NextResponse.json({ developers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch developers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
