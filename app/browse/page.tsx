'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { syncAndFilterItems } from '@/lib/clientStore';

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
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 overflow-x-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
          >
            Browse <span className="gradient-text">Resources</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-gray-500"
          >
            Select your department to access subject-wise study materials for all 6 semesters.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-medium animate-pulse">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No Departments Added Yet</h3>
            <p className="text-sm text-gray-400 mt-1">Admin can add engineering departments from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {departments.map((dept, i) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-full flex flex-col"
              >
                <Link
                  href={`/${dept.slug}`}
                  className="card p-5 sm:p-6 block hover:shadow-xl border border-surface-200/90 hover:border-primary-300 transition-all duration-300 group rounded-3xl relative overflow-hidden bg-white h-full flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl bg-surface-100/80 border border-surface-200/60 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 overflow-hidden flex-shrink-0">
                      {dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/')) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dept.icon} alt={dept.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        dept.icon || '📚'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 leading-snug">
                        {dept.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {dept.description || 'Access curated semester-wise syllabus, notes, lab manuals, and previous question papers.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-surface-100 flex items-center justify-between text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
                    <span>Browse Semesters</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
