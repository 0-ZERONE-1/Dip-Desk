import { NextResponse } from 'next/server';
import { getResourcesStore, getSubjectsStore } from '@/lib/store';

// Lightweight index for Fuse.js search — uses the same store fallback as all other routes
export async function GET() {
  try {
    const [resources, subjects] = await Promise.all([
      getResourcesStore(),
      getSubjectsStore(),
    ]);

    // Build a subject lookup map by _id for quick join
    const subjectMap: Record<string, any> = {};
    for (const s of subjects) {
      const id = s._id?.toString();
      if (id) subjectMap[id] = s;
    }

    const formattedResources = resources
      .filter((r: any) => r.isActive !== false)
      .map((r: any) => {
        // subjectId can be a string ID or a populated object
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
