'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BookOpen, ArrowRight, Loader2, Sparkles, GraduationCap } from 'lucide-react';
import { formatImageUrl, isImageUrl, getDepartmentNameBySlug } from '@/lib/utils';

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

  // Immediate display name — uses known mapping instantly, updates if custom name from API
  const displayName = dept?.name || getDepartmentNameBySlug(branchSlug);

  useEffect(() => {
    const minDelay = new Promise((res) => setTimeout(res, 2500));
    const apiFetch = fetch(`/api/departments?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.departments || [];
        const filteredList = syncAndFilterItems<Department>('departments', rawList);
        const found = filteredList.find((d: Department) => d.slug === branchSlug);
        setDept(found || null); // update name immediately, don't wait for delay
      })
      .catch(() => {});
    Promise.all([apiFetch, minDelay])
      .finally(() => setLoading(false));
  }, [branchSlug]);

  return (
    <div className="w-full">
      {/* Breadcrumb & Header are always visible immediately */}
      <Breadcrumb crumbs={[{ label: loading ? 'Loading...' : displayName }]} />

      {/* Header Banner */}
      <div className="mt-4 mb-6 bg-gradient-to-br from-surface-50 via-white to-primary-50/40 border border-surface-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden aspect-square">
            {dept && isImageUrl(dept.icon) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formatImageUrl(dept.icon)} alt={dept.name} className="w-full h-full object-cover rounded-2xl shadow-sm" />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#c026d3] flex items-center justify-center text-white shadow-md shadow-primary-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {loading ? 'Loading Department...' : displayName}
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 w-full"
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
              className="group bg-white rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden"
            >
              {/* Smooth Rounded Top Accent Gradient Bar blended with card */}
              <div className="absolute top-0 inset-x-6 sm:inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

              {/* Ambient Soft Glow in corner on Hover */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Main Content Header (Icon on left, text beside it) */}
              <div className="flex items-center gap-3.5 sm:gap-4 relative z-10 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#c026d3] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md shadow-primary-500/25 group-hover:scale-105 transition-all duration-300 flex-shrink-0 aspect-square">
                  {sem}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug break-words">
                    Semester {sem} Resources
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {sem <= 2
                      ? 'Foundation & general engineering core subjects for early semesters.'
                      : sem <= 4
                      ? 'Core departmental engineering subjects and practical lab modules.'
                      : 'Advanced specialized subjects, project work & elective modules.'}
                  </p>
                </div>
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
