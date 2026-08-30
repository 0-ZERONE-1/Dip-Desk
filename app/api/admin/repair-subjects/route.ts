import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import dbConnect from '@/lib/dbConnect';
import Subject from '@/lib/models/Subject';
import Department from '@/lib/models/Department';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));

    const departments = await Department.find({});
    let fixed = 0;
    let skipped = 0;

    const orphanedSubjects = await Subject.find({ departmentId: null });

    for (const sub of orphanedSubjects) {
      let targetDept: any = null;

      // Try matching by stored departmentSlug first
      const storedSlug = (sub as any).departmentSlug || '';
      if (storedSlug) {
        targetDept = departments.find((d: any) => d.slug === storedSlug);
      }

      // Fallback: use override slug from request body (e.g. { "defaultSlug": "cst" })
      if (!targetDept && body.defaultSlug) {
        targetDept = departments.find((d: any) => d.slug === body.defaultSlug);
      }

      if (targetDept) {
        await Subject.findByIdAndUpdate(sub._id, {
          departmentId: targetDept._id,
          departmentSlug: targetDept.slug,
        });
        fixed++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ ok: true, orphanedFound: orphanedSubjects.length, fixed, skipped });
  } catch (err: any) {
    console.error('repair-subjects error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await dbConnect();
    const departments = await Department.find({});
    const allSubjects = await Subject.find({});
    const orphaned = allSubjects.filter((s: any) => !s.departmentId);

    return NextResponse.json({
      total: allSubjects.length,
      orphaned: orphaned.length,
      departments: departments.map((d: any) => ({ _id: d._id, slug: d.slug, name: d.name })),
      orphanedSubjects: orphaned.map((s: any) => ({
        _id: s._id,
        name: s.name,
        semesterNumber: s.semesterNumber,
        departmentSlug: (s as any).departmentSlug || '(none)',
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
