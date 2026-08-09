import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ResourceRequest from '@/lib/models/ResourceRequest';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const requests = await ResourceRequest.find()
      .populate('studentId', 'name email')
      .populate({ path: 'subjectId', select: 'name semesterNumber', populate: { path: 'departmentId', select: 'name' } })
      .sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id, status, adminNote } = await req.json();
    const request = await ResourceRequest.findByIdAndUpdate(id, { status, adminNote }, { new: true });
    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
