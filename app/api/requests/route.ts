import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ResourceRequest from '@/lib/models/ResourceRequest';
import { createRequestStore, getRequestsStore, findUserByEmailStore, deleteRequestStore } from '@/lib/store';
import { sanitizeString, validateUrl } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userEmail = session.user?.email;
    if (userEmail) {
      const dbUser = await findUserByEmailStore(userEmail);
      if (dbUser && dbUser.isBanned) {
        return NextResponse.json(
          { error: 'Your account has been suspended/banned. You cannot submit new requests.' },
          { status: 403 }
        );
      }
    }

    const userId = (session.user as any).id || 'demo_student_id';
    const rawBody = await req.json();
    const { subjectTitle, category, description, department, semester, url } = rawBody;

    // ZERONE - Sanitize text fields and validate URL payload
    const cleanCategory    = sanitizeString(category, 100);
    const cleanDescription = sanitizeString(description, 1000);
    const cleanSubject     = sanitizeString(subjectTitle, 200);
    const cleanDepartment  = sanitizeString(department, 100);
    const cleanSemester    = sanitizeString(semester, 20);
    const cleanUrl         = url ? validateUrl(url) : '';

    if (!cleanCategory || !cleanDescription) {
      return NextResponse.json({ error: 'Category and description are required' }, { status: 400 });
    }

    if (url && cleanUrl === null) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const newReq = await createRequestStore({
      studentId: userId,
      studentEmail: userEmail || '',
      subjectTitle: cleanSubject || 'General',
      category: cleanCategory,
      description: cleanDescription,
      department: cleanDepartment || '',
      semester: cleanSemester || '',
      url: cleanUrl || '',
    });

    return NextResponse.json({ request: newReq }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const requests = await getRequestsStore();
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });

    const userEmail = session.user?.email || '';
    const userRole  = (session.user as any).role || 'student';

    // ZERONE - Restrict non-admin users to deleting only their own submitted requests
    if (userRole !== 'admin') {
      try {
        await dbConnect();
        const existing = await ResourceRequest.findById(id);
        if (!existing) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
        if (existing.studentEmail?.toLowerCase() !== userEmail.toLowerCase()) {
          return NextResponse.json(
            { error: 'Forbidden: You can only delete your own requests' },
            { status: 403 }
          );
        }
      } catch {
        // ZERONE - Local memory store fallback on DB query error
      }
    }

    await deleteRequestStore(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
