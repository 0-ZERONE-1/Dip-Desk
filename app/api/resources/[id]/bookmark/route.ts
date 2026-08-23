import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import { toggleBookmarkStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';

    // ZERONE - Toggle bookmark state in local memory store
    const isBookmarked = await toggleBookmarkStore(userId, id);

    // ZERONE - Sync user bookmarks list to MongoDB database
    if (userId.length === 24) {
      try {
        const resourceId = new mongoose.Types.ObjectId(id);
        await dbConnect();
        const user = await User.findById(userId);
        if (user) {
          const dbIsBookmarked = user.bookmarks.some((bId: any) => bId.toString() === id);
          if (dbIsBookmarked) {
            user.bookmarks = user.bookmarks.filter((bId: any) => bId.toString() !== id);
          } else {
            user.bookmarks.push(resourceId);
          }
          await user.save();
        }
      } catch {}
    }

    return NextResponse.json({ isBookmarked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
