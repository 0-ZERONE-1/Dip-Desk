'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { filterClientDeleted } from '@/lib/clientStore';

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
        setDepartments(filterClientDeleted(data.departments || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-10 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-10">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {departments.map((dept, i) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/${dept.slug}`}
                  className="card p-6 block hover:shadow-hover border border-surface-200 transition-all duration-300 group h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-surface-100 group-hover:scale-110 transition-transform overflow-hidden">
                      {dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/')) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dept.icon} alt={dept.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        dept.icon || '📚'
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {dept.name}
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {dept.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-primary-600 group-hover:gap-2 transition-all">
                    <span>Browse Semesters</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
