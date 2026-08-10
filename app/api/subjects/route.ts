import { NextRequest, NextResponse } from 'next/server';
import { getSubjectsStore, createSubjectStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semesterNumber = searchParams.get('semester');
  const departmentSlug = searchParams.get('departmentSlug');

  try {
    const subjects = await getSubjectsStore(
      departmentSlug || undefined,
      semesterNumber ? parseInt(semesterNumber) : undefined
    );
    return NextResponse.json({ subjects }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, semesterNumber, departmentId } = body;

    if (!name || !semesterNumber || !departmentId) {
      return NextResponse.json({ error: 'Name, semester, and department are required' }, { status: 400 });
    }

    const subject = await createSubjectStore(body);
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
