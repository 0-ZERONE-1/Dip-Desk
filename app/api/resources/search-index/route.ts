import { NextResponse } from 'next/server';
import { getResourcesStore, getSubjectsStore } from '@/lib/store';

// ZERONE - Build lightweight JSON index for client-side Fuse.js global search
export async function GET() {
  try {
    const [resources, subjects] = await Promise.all([
      getResourcesStore(),
      getSubjectsStore(),
    ]);

    // ZERONE - Build subject lookup map for quick relational joins
    const subjectMap: Record<string, any> = {};
    for (const s of subjects) {
      const id = s._id?.toString();
      if (id) subjectMap[id] = s;
    }

    const formattedResources = resources
      .filter((r: any) => r.isActive !== false)
      .map((r: any) => {
        // ZERONE - Resolve subject object from string ID or populated reference
        let subjectObj: any = null;
        if (typeof r.subjectId === 'object' && r.subjectId !== null) {
          subjectObj = r.subjectId;
        } else if (typeof r.subjectId === 'string') {
          subjectObj = subjectMap[r.subjectId] || null;
        }

        const deptObj = subjectObj?.departmentId;
        const deptName = typeof deptObj === 'object' ? deptObj?.name : '';
        const deptSlug = typeof deptObj === 'object' ? deptObj?.slug : '';

        return {
          _id: r._id?.toString(),
          title: r.title,
          category: r.category,
          type: 'resource',
          subject: {
            name: subjectObj?.name || '',
            slug: subjectObj?.slug || '',
            semesterNumber: subjectObj?.semesterNumber || 1,
          },
          department: {
            name: deptName,
            slug: deptSlug,
          },
        };
      });

    const formattedSubjects = subjects
      .filter((s: any) => s.isActive !== false)
      .map((s: any) => {
        const deptObj = s.departmentId;
        const deptName = typeof deptObj === 'object' ? deptObj?.name : '';
        const deptSlug = typeof deptObj === 'object' ? deptObj?.slug : '';

        return {
          _id: s._id?.toString(),
          title: s.name,
          category: 'Subject',
          type: 'subject',
          subject: {
            name: s.name,
            slug: s.slug,
            semesterNumber: s.semesterNumber,
          },
          department: {
            name: deptName,
            slug: deptSlug,
          },
        };
      });

    return NextResponse.json({ resources: [...formattedResources, ...formattedSubjects] });
  } catch (error) {
    console.error('Failed to build search index:', error);
    return NextResponse.json({ error: 'Failed to build search index' }, { status: 500 });
  }
}
