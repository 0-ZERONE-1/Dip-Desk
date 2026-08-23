import { NextRequest, NextResponse } from 'next/server';
import { getStatsStore, updateStatsStore, incrementVisitorStore } from '@/lib/store';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldTrack = searchParams.get('track') === '1';

    if (shouldTrack) {
      await incrementVisitorStore();
    }

    const stats = await getStatsStore();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('Failed to fetch stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await req.json();

    if (body.reset) {
      // Clear all overrides
      const updated = await updateStatsStore({
        overrideResources: null,
        overrideSubjects: null,
        overrideStudents: null,
        overrideVisitors: null,
      });
      return NextResponse.json(updated);
    }

    const updated = await updateStatsStore({
      overrideResources: typeof body.overrideResources === 'number' ? body.overrideResources : body.overrideResources === null ? null : undefined,
      overrideSubjects: typeof body.overrideSubjects === 'number' ? body.overrideSubjects : body.overrideSubjects === null ? null : undefined,
      overrideStudents: typeof body.overrideStudents === 'number' ? body.overrideStudents : body.overrideStudents === null ? null : undefined,
      overrideVisitors: typeof body.overrideVisitors === 'number' ? body.overrideVisitors : body.overrideVisitors === null ? null : undefined,
      customLogoUrl: typeof body.customLogoUrl === 'string' ? body.customLogoUrl : undefined,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Failed to update stats:', err);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}
