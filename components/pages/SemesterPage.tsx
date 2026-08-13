'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

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

  const formattedDeptName = deptName || branchSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="w-full">
      <Breadcrumb
        crumbs={[
          { label: formattedDeptName, href: `/${branchSlug}` },
          { label: `Semester ${semesterNumber}` },
        ]}
      />

      {/* Top Banner (Semester Header matching Department page banner layout) */}
      <div className="mt-4 mb-6 bg-gradient-to-br from-surface-50 via-white to-primary-50/40 border border-surface-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-md rounded-xl flex items-center justify-center text-xl sm:text-2xl font-extrabold flex-shrink-0 aspect-square">
            {semesterNumber}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Semester {semesterNumber}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {formattedDeptName}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Container Layout */}
      {subjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-2xl border border-surface-200/90 shadow-sm p-12 sm:p-16 text-center flex flex-col items-center justify-center min-h-[300px]"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-50 border border-surface-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-xs">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 stroke-[1.5]" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-1">
            No subjects yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Admins haven&apos;t added subjects for this semester yet.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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

