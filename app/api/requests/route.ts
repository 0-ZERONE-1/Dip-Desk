import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import ResourceRequest from '@/lib/models/ResourceRequest';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    await dbConnect();
    const { subjectId, category, description } = await req.json();

    if (!subjectId || !category || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const request = await ResourceRequest.create({
      studentId: userId,
      subjectId,
      category,
      description,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
