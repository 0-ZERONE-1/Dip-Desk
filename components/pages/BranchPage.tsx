'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BookOpen, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { formatImageUrl, isImageUrl } from '@/lib/utils';

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

const semesterColors = [
  'from-blue-500 to-indigo-600 shadow-blue-500/20',
  'from-violet-500 to-purple-600 shadow-purple-500/20',
  'from-emerald-500 to-teal-600 shadow-teal-500/20',
  'from-amber-500 to-orange-600 shadow-orange-500/20',
  'from-pink-500 to-rose-600 shadow-pink-500/20',
  'from-cyan-500 to-blue-600 shadow-cyan-500/20',
];

export default function BranchPage({ branchSlug }: Props) {
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        const found = data.departments?.find((d: Department) => d.slug === branchSlug);
        setDept(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!dept) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Branch not found.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb crumbs={[{ label: dept.name }]} />

      {/* Header Banner */}
      <div className="mt-4 mb-6 bg-gradient-to-br from-surface-50 via-white to-primary-50/40 border border-surface-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${
              isImageUrl(dept.icon)
                ? 'bg-transparent'
                : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-md'
            } rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 overflow-hidden aspect-square`}
          >
            {isImageUrl(dept.icon) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formatImageUrl(dept.icon)} alt={dept.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>{dept.icon || '📁'}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {dept.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {dept.description || 'Select a semester to access syllabus, notes, model papers, and lab manuals.'}
            </p>
          </div>
        </div>
      </div>

      {/* Semester Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((sem, i) => (
          <motion.div
            key={sem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="h-full"
          >
            <Link
              href={`/${branchSlug}/semester-${sem}`}
              id={`semester-${sem}-card`}
              className="group bg-white rounded-2xl border border-surface-200/80 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden"
            >
              {/* Top Accent Pill */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${semesterColors[i]} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-all duration-300`}>
                  {sem}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                  Semester {sem}
                </span>
              </div>

              {/* Main Content */}
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
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
              <div className="flex items-center justify-between w-full pt-3 border-t border-surface-100 text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors mt-auto">
                <span>View Subjects</span>
                <div className="w-7 h-7 rounded-full bg-primary-50 group-hover:bg-primary-600 text-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
