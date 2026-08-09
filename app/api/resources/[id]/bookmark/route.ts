import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const resourceId = new mongoose.Types.ObjectId(params.id);

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isBookmarked = user.bookmarks.some((id: any) => id.toString() === params.id);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((id: any) => id.toString() !== params.id);
    } else {
      user.bookmarks.push(resourceId);
    }

    await user.save();
    return NextResponse.json({ isBookmarked: !isBookmarked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
