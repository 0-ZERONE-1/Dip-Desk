'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { syncAndFilterItems } from '@/lib/clientStore';

import dynamic from 'next/dynamic';

const BrowseLottieLoader = dynamic(
  () => import('@/components/BrowseLottieLoader'),
  { ssr: false }
);

interface Department {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const popUpCardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.65,
    y: 35,
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

export default function BrowsePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/departments?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setDepartments(syncAndFilterItems<Department>('departments', data.departments || []));
        setTimeout(() => setLoading(false), 1200);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 flex-1 overflow-x-hidden">
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
          <BrowseLottieLoader />
        ) : departments.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No Departments Added Yet</h3>
            <p className="text-sm text-gray-400 mt-1">Admin can add engineering departments from the admin panel.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full"
          >
            {departments.map((dept) => (
              <motion.div
                key={dept._id}
                variants={popUpCardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="h-full flex flex-col"
              >
                <Link
                  href={`/${dept.slug}`}
                  className="group bg-white p-6 sm:p-7 block border border-surface-200/90 hover:border-primary-300 rounded-3xl relative h-full flex flex-col justify-between shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Smooth Rounded Top Accent Gradient Bar blended with card */}
                  <div className="absolute top-0 inset-x-6 sm:inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                  {/* Ambient Soft Glow in corner on Hover */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl bg-surface-100/90 border border-surface-200/70 group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary-500/15 transition-all duration-300 overflow-hidden flex-shrink-0">
                      {dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/')) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dept.icon} alt={dept.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        dept.icon || '📚'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug break-normal [word-break:keep-all]">
                        {dept.name}
                      </h2>
                      {dept.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 leading-relaxed">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-surface-100/90 flex items-center justify-between text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors relative z-10">
                    <span className="tracking-tight">Browse Semesters</span>
                    <div className="w-8 h-8 rounded-full bg-primary-50 group-hover:bg-primary-600 text-primary-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-sm">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </>
  );
}
