import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ResourceRequest from '@/lib/models/ResourceRequest';
import { createRequestStore, getRequestsStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || 'demo_student_id';
    const { subjectTitle, category, description, department, semester, url } = await req.json();

    if (!category || !description) {
      return NextResponse.json({ error: 'Category and description are required' }, { status: 400 });
    }

    try {
      await dbConnect();
      await ResourceRequest.create({
        studentId: userId,
        category,
        description,
        subjectTitle,
        department,
        semester,
        url,
      });
    } catch {}

    const newReq = await createRequestStore({
      studentId: userId,
      studentEmail: session.user?.email,
      subjectTitle: subjectTitle || 'General',
      category,
      description,
      department: department || '',
      semester: semester || '',
      url: url || '',
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
