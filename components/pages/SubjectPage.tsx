'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ResourceCard from '@/components/ResourceCard';
import RequestForm from '@/components/RequestForm';
import { syncAndFilterItems } from '@/lib/clientStore';
import { BookOpen, Loader2, PlusCircle, FileText, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn, CATEGORIES, categoryIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

const ResourceLottieLoader = dynamic(
  () => import('@/components/ResourceLottieLoader'),
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

interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  coverImage?: string;
  category: string;
  upvotes: number;
  downvotes: number;
  isActive: boolean;
  createdAt: string;
  userVote?: 'up' | 'down' | null;
  isBookmarked?: boolean;
}

interface Props {
  branchSlug: string;
  semesterNumber: number;
  subjectSlug: string;
}

export default function SubjectPage({ branchSlug, semesterNumber, subjectSlug }: Props) {
  const { data: session } = useSession();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Load subject info
  useEffect(() => {
    fetch(`/api/subjects?departmentSlug=${branchSlug}&semester=${semesterNumber}&t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.subjects || [];
        const filteredList = syncAndFilterItems<Subject>('subjects', rawList, { departmentSlug: branchSlug, semesterNumber: semesterNumber });
        const found = filteredList.find((s: Subject) => s.slug === subjectSlug);
        setSubject(found || null);
        setTimeout(() => setLoading(false), 1200);
      })
      .catch(() => setTimeout(() => setLoading(false), 1200));
  }, [branchSlug, semesterNumber, subjectSlug]);

  // Load resources when subject and category change
  useEffect(() => {
    if (!subject) return;
    setResourcesLoading(true);
    fetch(
      `/api/resources?subjectId=${subject._id}&category=${encodeURIComponent(activeCategory)}&t=${Date.now()}`,
      { cache: 'no-store' }
    )
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.resources || [];
        setResources(syncAndFilterItems<Resource>('resources', rawList, { subjectId: subject._id, category: activeCategory }));
        setTimeout(() => setResourcesLoading(false), 800);
      })
      .catch(() => setResourcesLoading(false));
  }, [subject, activeCategory]);

  if (!loading && !subject) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Subject not found.</p>
      </div>
    );
  }

  const deptName = subject?.departmentId?.name || branchSlug.toUpperCase();
  const deptSlug = subject?.departmentId?.slug || branchSlug;

  return (
    <div className="w-full">
      <Breadcrumb
        crumbs={[
          { label: deptName, href: `/${deptSlug}` },
          { label: `Semester ${semesterNumber}`, href: `/${deptSlug}/semester-${semesterNumber}` },
          { label: subject ? subject.name : 'Loading...' },
        ]}
      />

      {/* Subject Header Banner */}
      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-surface-50 to-primary-50/30 border border-surface-200/80 shadow-sm">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="gradient-text">{subject ? subject.name : 'Loading Resources...'}</span>
          </h1>
          {subject?.description && (
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-2xl leading-relaxed">
              {subject.description}
            </p>
          )}
        </div>
        <button
          id="request-resource-btn"
          onClick={() => setShowRequestForm(true)}
          className="btn-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 flex-shrink-0 self-start md:self-center hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Request Resource
        </button>
      </div>

      {loading ? (
        <ResourceLottieLoader />
      ) : (
        <>
          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-2xs flex-shrink-0',
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                      : 'bg-white border border-surface-200/90 text-gray-700 hover:bg-surface-100 hover:border-surface-300'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Resources Main Panel */}
          {resourcesLoading ? (
            <ResourceLottieLoader />
          ) : resources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 sm:p-16 text-center border-surface-200/90 bg-gradient-to-br from-white via-surface-50 to-primary-50/20 shadow-card rounded-3xl w-full my-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100/80 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm text-2xl">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
            No {activeCategory} Available Yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
            Be the first student to request materials for <span className="font-semibold text-gray-700">{subject?.name || ''}</span>. Our team will verify and upload it!
          </p>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn-primary px-6 py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md inline-flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Request {activeCategory}
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className={cn(
              'grid gap-3.5 sm:gap-4.5',
              ['Books', 'Model Question Papers', 'Syllabus'].includes(activeCategory)
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {resources.map((resource, i) => (
              <ResourceCard key={resource._id} resource={resource} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  )}

      {/* Request Form Modal */}
      {showRequestForm && subject && (
        <RequestForm
          subjectId={subject._id}
          subjectName={subject.name}
          defaultCategory={activeCategory}
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}
