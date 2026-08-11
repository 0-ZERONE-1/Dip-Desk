'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ArrowRight, BookOpen, Loader2, Plus } from 'lucide-react';

import { syncAndFilterItems } from '@/lib/clientStore';

interface Subject {
  _id: string;
  name: string;
  slug: string;
  semesterNumber: number;
  description: string;
  departmentId: { name: string; slug: string };
}

interface Props {
  branchSlug: string;
  semesterNumber: number;
}

export default function SemesterPage({ branchSlug, semesterNumber }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [deptName, setDeptName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = Date.now();
    Promise.all([
      fetch(`/api/subjects?departmentSlug=${branchSlug}&semester=${semesterNumber}&t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([subData, deptData]) => {
        const subList = syncAndFilterItems<Subject>('subjects', subData.subjects || [], { departmentSlug: branchSlug, semesterNumber: semesterNumber });
        const deptList = syncAndFilterItems<any>('departments', deptData.departments || []);
        const deptFound = deptList.find((d: any) => d.slug === branchSlug);
        if (deptFound) setDeptName(deptFound.name);
        setSubjects(subList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchSlug, semesterNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb
        crumbs={[
          { label: deptName || branchSlug.toUpperCase(), href: `/${branchSlug}` },
          { label: `Semester ${semesterNumber}` },
        ]}
      />

      <div className="mt-6 mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Semester <span className="gradient-text">{semesterNumber}</span>
        </h1>
        <p className="text-gray-500 mt-2">
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {deptName}
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No subjects yet</h3>
          <p className="text-gray-400 text-sm">Admins haven't added subjects for this semester yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={`/${branchSlug}/semester-${semesterNumber}/${subject.slug}`}
                id={`subject-${subject.slug}`}
                className="group card-hover p-5 flex items-center gap-4 block"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{subject.description}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
