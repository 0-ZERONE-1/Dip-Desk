'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

import { syncAndFilterItems } from '@/lib/clientStore';

import dynamic from 'next/dynamic';

const SemesterLottieLoader = dynamic(
  () => import('@/components/SemesterLottieLoader'),
  { ssr: false }
);

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const subjectCardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.68,
    y: 32,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 18,
      mass: 0.8,
    },
  },
};

export default function SemesterPage({ branchSlug, semesterNumber }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [deptName, setDeptName] = useState(
    // Immediate fallback from slug
    branchSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );
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
        setTimeout(() => setLoading(false), 1200);
      })
      .catch(() => setLoading(false));
  }, [branchSlug, semesterNumber]);

  // formattedDeptName is always available immediately
  const formattedDeptName = deptName;

  return (
    <div className="w-full">
      {/* Breadcrumb & Header always visible immediately */}
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
              {loading ? `${formattedDeptName}` : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} · ${formattedDeptName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards — show Lottie loader until data is ready */}
      {loading ? (
        <SemesterLottieLoader />
      ) : subjects.length === 0 ? (
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full"
        >
          {subjects.map((subject) => (
            <motion.div
              key={subject._id}
              variants={subjectCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
              className="h-full flex flex-col"
            >
              <Link
                href={`/${branchSlug}/semester-${semesterNumber}/${subject.slug}`}
                id={`subject-${subject.slug}`}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-4 sm:p-4.5 flex flex-col justify-between h-full relative overflow-hidden"
              >
                {/* Smooth Rounded Top Accent Gradient Bar blended with card */}
                <div className="absolute top-0 inset-x-5 sm:inset-x-7 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                {/* Ambient Soft Glow in corner on Hover */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top Icon & Badge Header */}
                <div className="flex items-start justify-between mb-2.5 relative z-10">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/80 border border-primary-100/90 flex items-center justify-center text-primary-600 shadow-xs group-hover:scale-105 group-hover:bg-primary-100 group-hover:shadow-md group-hover:shadow-primary-500/15 transition-all duration-300 flex-shrink-0">
                    <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary-600" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-surface-100/90 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200/80 border border-transparent transition-all duration-300">
                    Sem {semesterNumber}
                  </span>
                </div>

                {/* Main Content */}
                <div className="mb-2.5 relative z-10">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 leading-snug">
                    {subject.name}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {subject.description || 'Access notes, question papers, syllabus routines, and lab manuals.'}
                  </p>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between w-full pt-2.5 border-t border-surface-100/90 text-xs font-bold text-primary-600 group-hover:text-primary-700 transition-colors mt-auto relative z-10">
                  <span className="tracking-tight">View Resources</span>
                  <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-primary-50 group-hover:bg-primary-600 text-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

