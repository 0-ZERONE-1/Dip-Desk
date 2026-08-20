'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BookOpen, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { formatImageUrl, isImageUrl } from '@/lib/utils';

import { syncAndFilterItems } from '@/lib/clientStore';

import dynamic from 'next/dynamic';

const SemesterLottieLoader = dynamic(
  () => import('@/components/SemesterLottieLoader'),
  { ssr: false }
);

interface Department {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Props {
  branchSlug: string;
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

const semesterCardVariants = {
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

// Derive a readable name from slug as immediate fallback
function slugToName(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function BranchPage({ branchSlug }: Props) {
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  // Immediate display name — updates once API responds
  const displayName = dept?.name || slugToName(branchSlug);

  useEffect(() => {
    fetch(`/api/departments?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.departments || [];
        const filteredList = syncAndFilterItems<Department>('departments', rawList);
        const found = filteredList.find((d: Department) => d.slug === branchSlug);
        setDept(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchSlug]);

  return (
    <div className="w-full">
      {/* Breadcrumb & Header are always visible immediately */}
      <Breadcrumb crumbs={[{ label: displayName }]} />

      {/* Header Banner */}
      <div className="mt-4 mb-6 bg-gradient-to-br from-surface-50 via-white to-primary-50/40 border border-surface-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${
              dept && isImageUrl(dept.icon)
                ? 'bg-transparent'
                : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-md'
            } rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 overflow-hidden aspect-square`}
          >
            {dept && isImageUrl(dept.icon) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formatImageUrl(dept.icon)} alt={dept.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>{dept?.icon || '📁'}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {dept?.description || 'Select a semester to access syllabus, notes, model papers, and lab manuals.'}
            </p>
          </div>
        </div>
      </div>

      {/* Semester Grid — shows Lottie loader until data is ready */}
      {loading ? (
        <SemesterLottieLoader />
      ) : !dept ? (
        <div className="text-center py-24">
          <p className="text-gray-500">Branch not found.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
        </div>
      ) : (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {[1, 2, 3, 4, 5, 6].map((sem) => (
          <motion.div
            key={sem}
            variants={semesterCardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="h-full flex flex-col"
          >
            <Link
              href={`/${branchSlug}/semester-${sem}`}
              id={`semester-${sem}-card`}
              className="group bg-white rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden"
            >
              {/* Smooth Rounded Top Accent Gradient Bar blended with card */}
              <div className="absolute top-0 inset-x-6 sm:inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

              {/* Ambient Soft Glow in corner on Hover */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top Accent Pill */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                  {sem}
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-surface-100/90 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200/80 border border-transparent transition-all duration-300">
                  Semester {sem}
                </span>
              </div>

              {/* Main Content */}
              <div className="mb-5 relative z-10">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5 leading-snug">
                  Semester {sem} Resources
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {sem <= 2
                    ? 'Foundation & general engineering core subjects for early semesters.'
                    : sem <= 4
                    ? 'Core departmental engineering subjects and practical lab modules.'
                    : 'Advanced specialized subjects, project work & elective modules.'}
                </p>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-surface-100/90 text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors mt-auto relative z-10">
                <span className="tracking-tight">View Subjects</span>
                <div className="w-8 h-8 rounded-full bg-primary-50 group-hover:bg-primary-600 text-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
