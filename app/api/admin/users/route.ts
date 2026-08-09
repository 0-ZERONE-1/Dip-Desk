import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const users = await User.find({ role: 'student' })
      .select('-bookmarks -resourceRequests')
      .sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
