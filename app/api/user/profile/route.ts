import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Admin from '@/lib/models/Admin';
import { updateUserStore, findUserByIdStore, getResourcesStore } from '@/lib/store';
import { sanitizeString, validateUrl } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';
    const userEmail = session.user?.email ? session.user.email.toLowerCase().trim() : '';
    const { name, title, institute, regNumber, image } = await req.json();

    // Sanitize and validate all profile fields
    const cleanName      = sanitizeString(name, 80);
    const cleanTitle     = sanitizeString(title, 60);
    const cleanInstitute = sanitizeString(institute, 120);
    const cleanRegNumber = sanitizeString(regNumber, 30);

    if (!cleanName || !cleanTitle || !cleanInstitute || !cleanRegNumber) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate the image URL — must be https and not a private/local address
    let cleanImage = '';
    if (image) {
      const validatedUrl = validateUrl(image);
      if (validatedUrl === null) {
        return NextResponse.json(
          { error: 'Invalid image URL. Only public http/https URLs are allowed.' },
          { status: 400 }
        );
      }
      cleanImage = validatedUrl;
    }

    const updatedData = {
      name: cleanName,
      email: userEmail,
      title: cleanTitle,
      institute: cleanInstitute,
      regNumber: cleanRegNumber,
      image: cleanImage,
      isProfileComplete: true,
    };

    // Update in local store under ID and Email
    let localUser = await updateUserStore(userId, updatedData);
    if (userEmail && userEmail !== userId) {
      await updateUserStore(userEmail, updatedData);
    }

    // Update in MongoDB Atlas
    try {
      await dbConnect();
      const queryConditions: any[] = [];
      if (userEmail) queryConditions.push({ email: userEmail });
      if (mongoose.Types.ObjectId.isValid(userId)) queryConditions.push({ _id: userId });

      if (queryConditions.length > 0) {
        const dbUser = await User.findOneAndUpdate(
          { $or: queryConditions },
          { $set: updatedData },
          { new: true, upsert: true }
        );
        if (dbUser) {
          return NextResponse.json({ user: dbUser });
        }
      }

      // Also update Admin name if admin
      if (userEmail) {
        await Admin.findOneAndUpdate({ email: userEmail }, { $set: { name } });
      }
    } catch (dbErr) {
      console.error('Error saving profile to MongoDB:', dbErr);
    }

    return NextResponse.json({ user: localUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';
    const userEmail = session.user?.email ? session.user.email.toLowerCase().trim() : '';

    // 1. Try to fetch from MongoDB
    try {
      await dbConnect();
      const queryConditions: any[] = [];
      if (userEmail) queryConditions.push({ email: userEmail });
      if (mongoose.Types.ObjectId.isValid(userId)) queryConditions.push({ _id: userId });

      if (queryConditions.length > 0) {
        const dbUser = await User.findOne({ $or: queryConditions }).populate({
          path: 'bookmarks',
          populate: {
            path: 'subjectId',
            select: 'name slug semesterNumber',
            populate: { path: 'departmentId', select: 'name slug' },
          },
        });

        if (dbUser) {
          return NextResponse.json({
            user: {
              _id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              title: dbUser.title || 'Student',
              institute: dbUser.institute || '',
              regNumber: dbUser.regNumber || '',
              image: dbUser.image || session.user?.image || '',
              role: dbUser.role || 'student',
              isProfileComplete: dbUser.isProfileComplete ?? true,
              isBanned: dbUser.isBanned ?? false,
              bookmarks: dbUser.bookmarks || [],
            },
          }, {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          });
        }
      }
    } catch (dbErr) {
      console.error('Error fetching profile from MongoDB:', dbErr);
    }

    // 2. Fallback to Local Store / Session
    let storeUser = (await findUserByIdStore(userId)) || (userEmail ? await findUserByIdStore(userEmail) : null);
    if (!storeUser) {
      storeUser = {
        _id: userId,
        name: session.user?.name || 'User',
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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
