import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { updateUserStore, findUserByIdStore, getResourcesStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';
    const userEmail = session.user?.email;
    const { name, title, institute, regNumber } = await req.json();

    if (!name || !title || !institute || !regNumber) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const updatedData = { name, email: userEmail, title, institute, regNumber, isProfileComplete: true };

    // Update in local store under both ID and Email
    let localUser = await updateUserStore(userId, updatedData);
    if (userEmail && userEmail !== userId) {
      await updateUserStore(userEmail, updatedData);
    }

    // Update in MongoDB if available and valid ObjectId
    if (userId.length === 24) {
      try {
        await dbConnect();
        await User.findByIdAndUpdate(userId, updatedData, { new: true });
      } catch {}
    }

    return NextResponse.json({ user: localUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';
    const userEmail = session.user?.email;

    if (userId.length === 24) {
      try {
        await dbConnect();
        const user = await User.findById(userId).populate({
          path: 'bookmarks',
          populate: {
            path: 'subjectId',
            select: 'name slug semesterNumber',
            populate: { path: 'departmentId', select: 'name slug' },
          },
        });
        if (user) return NextResponse.json({ user });
      } catch {}
    }

    let storeUser = (await findUserByIdStore(userId)) || (userEmail ? await findUserByIdStore(userEmail) : null);
    if (!storeUser) {
      storeUser = {
        _id: userId,
        name: session.user?.name || 'Student',
        email: userEmail || '',
        title: 'Student',
        institute: '',
        regNumber: '',
        role: 'student',
        isProfileComplete: true,
        bookmarks: [],
      };
    }

    const allResources = await getResourcesStore();
    const userBookmarkIds = (storeUser?.bookmarks || []).map((b: any) => (typeof b === 'string' ? b : b._id));
    const populatedBookmarks = allResources.filter((r: any) => userBookmarkIds.includes(r._id));

    return NextResponse.json({
      user: {
        ...storeUser,
        name: storeUser.name || session.user?.name || 'Student',
        email: storeUser.email || userEmail || '',
        bookmarks: populatedBookmarks,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
