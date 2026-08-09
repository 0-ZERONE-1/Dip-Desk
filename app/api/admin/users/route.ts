import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { getUsersStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let mongoUsers: any[] = [];
    try {
      await dbConnect();
      mongoUsers = await User.find({ role: 'student' })
        .select('-bookmarks -resourceRequests')
        .sort({ createdAt: -1 });
    } catch {}

    const storeUsers = await getUsersStore();
    const combined: any[] = [...mongoUsers];

    for (const u of storeUsers) {
      if (u.email && !combined.some((m: any) => m.email?.toLowerCase() === u.email?.toLowerCase())) {
        combined.push(u);
      }
    }

    return NextResponse.json({ users: combined });
  } catch {
    const storeUsers = await getUsersStore();
    return NextResponse.json({ users: storeUsers || [] });
  }
}
