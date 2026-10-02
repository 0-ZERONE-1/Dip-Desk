import { NextResponse } from 'next/server';
import { getResourcesStore, getSubjectsStore, getDepartmentsStore } from '@/lib/store';

// ZERONE - Build lightweight JSON index for client-side Fuse.js global search
export async function GET() {
  try {
    const [resources, subjects, departments] = await Promise.all([
      getResourcesStore(),
      getSubjectsStore(),
      getDepartmentsStore(),
    ]);

    // ZERONE - Build subject lookup map for quick relational joins
    const subjectMap: Record<string, any> = {};
    for (const s of subjects) {
      const id = s._id?.toString();
      if (id) subjectMap[id] = s;
    }

    const deptMap: Record<string, any> = {};
    for (const d of departments) {
      const id = d._id?.toString();
      if (id) deptMap[id] = d;
      if (d.slug) deptMap[d.slug] = d;
    }

    const formattedResources = resources
      .filter((r: any) => r.isActive !== false)
      .map((r: any) => {
        let subjectObj: any = null;
        if (typeof r.subjectId === 'object' && r.subjectId !== null) {
          subjectObj = r.subjectId;
        } else if (typeof r.subjectId === 'string') {
          subjectObj = subjectMap[r.subjectId] || null;
        }

        const deptObj = subjectObj?.departmentId;
        let deptName = typeof deptObj === 'object' ? deptObj?.name : '';
        let deptSlug = typeof deptObj === 'object' ? deptObj?.slug : '';

        if (!deptName && r.departmentId) {
          const dId = typeof r.departmentId === 'object' ? r.departmentId?._id?.toString() : r.departmentId;
          const matchedDept = deptMap[dId];
          if (matchedDept) {
            deptName = matchedDept.name;
            deptSlug = matchedDept.slug;
          }
        }
        if (!deptName && !r.subjectId) {
          deptName = 'All Departments';
        }

        const semNumber = subjectObj?.semesterNumber || r.semesterNumber || null;

        return {
          _id: r._id?.toString(),
          title: r.title,
          category: r.category,
          type: 'resource',
          subject: {
            name: subjectObj?.name || (semNumber ? `All Subjects (Sem ${semNumber})` : 'All Subjects'),
            slug: subjectObj?.slug || '',
            semesterNumber: semNumber || 1,
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
