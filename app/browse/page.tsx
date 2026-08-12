'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { syncAndFilterItems } from '@/lib/clientStore';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { formatImageUrl, isImageUrl } from '@/lib/utils';

interface Department {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export default function BrowsePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/departments?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setDepartments(syncAndFilterItems<Department>('departments', data.departments || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-8 flex-1 w-full">
        <Breadcrumb crumbs={[{ label: 'Browse Departments' }]} />

        {/* Header Banner matching Resource & Department Page Header design */}
        <div className="mt-4 mb-6 bg-gradient-to-br from-surface-50 via-white to-primary-50/40 border border-surface-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-md rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0 aspect-square">
              <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Browse Departments
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                Select your engineering department to access subject-wise study materials for all 6 semesters.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-medium animate-pulse">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-2xl border border-surface-200/90 shadow-sm p-12 sm:p-16 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-50 border border-surface-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-xs">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-1">
              No Departments Added Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Admin can add engineering departments from the admin panel.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
            {departments.map((dept, i) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="h-full flex flex-col"
              >
                <Link
                  href={`/${dept.slug}`}
                  id={`dept-${dept.slug}`}
                  className="group bg-white rounded-2xl border border-surface-200/80 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden"
                >
                  <div>
                    {/* Top Pill & Icon Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${
                          isImageUrl(dept.icon)
                            ? 'bg-transparent'
                            : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-md'
                        } rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 overflow-hidden aspect-square group-hover:scale-105 transition-transform duration-300`}
                      >
                        {isImageUrl(dept.icon) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={formatImageUrl(dept.icon)} alt={dept.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span>{dept.icon || '📁'}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors flex-shrink-0">
                        All 6 Semesters
                      </span>
                    </div>

                    {/* Department Title & Description */}
                    <div className="mb-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                        {dept.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {dept.description || 'Access syllabus, notes, model question papers, and lab manuals.'}
                      </p>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between w-full pt-3 border-t border-surface-100 text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors mt-auto">
                    <span>Browse Semesters</span>
                    <div className="w-7 h-7 rounded-full bg-primary-50 group-hover:bg-primary-600 text-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

