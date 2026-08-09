import { NextRequest, NextResponse } from 'next/server';
import { getDepartmentsStore, createDepartmentStore } from '@/lib/store';

export async function GET() {
  try {
    const departments = await getDepartmentsStore();
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const dept = await createDepartmentStore(body);
    return NextResponse.json({ department: dept }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
