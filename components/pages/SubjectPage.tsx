'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ResourceCard from '@/components/ResourceCard';
import RequestForm from '@/components/RequestForm';
import { filterClientDeleted } from '@/lib/clientStore';
import { BookOpen, Loader2, PlusCircle, FileText, Sparkles } from 'lucide-react';
import { cn, CATEGORIES, categoryIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const [activeCategory, setActiveCategory] = useState<string>('Notes');
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Load subject info
  useEffect(() => {
    fetch(`/api/subjects?departmentSlug=${branchSlug}&semester=${semesterNumber}&t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.subjects || [];
        const filteredList = filterClientDeleted<Subject>(rawList);
        const found = filteredList.find((s: Subject) => s.slug === subjectSlug);
        setSubject(found || null);
        setLoading(false);
      });
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
        setResources(filterClientDeleted(rawList));
        setResourcesLoading(false);
      })
      .catch(() => setResourcesLoading(false));
  }, [subject, activeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Subject not found.</p>
      </div>
    );
  }

  const deptName = subject.departmentId?.name || branchSlug.toUpperCase();
  const deptSlug = subject.departmentId?.slug || branchSlug;

  return (
    <div className="w-full">
      <Breadcrumb
        crumbs={[
          { label: deptName, href: `/${deptSlug}` },
          { label: `Semester ${semesterNumber}`, href: `/${deptSlug}/semester-${semesterNumber}` },
          { label: subject.name },
        ]}
      />

      {/* Subject Header Banner */}
      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-surface-50 to-primary-50/30 border border-surface-200/80 shadow-sm">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="gradient-text">{subject.name}</span>
          </h1>
          {subject.description && (
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

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-2.5 flex-wrap mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              id={`tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                  : 'bg-white border border-surface-200 text-gray-700 hover:bg-surface-100 hover:border-surface-300'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Resources Main Panel */}
      {resourcesLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium animate-pulse">Loading {activeCategory}...</p>
        </div>
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
            Be the first student to request materials for <span className="font-semibold text-gray-700">{subject.name}</span>. Our team will verify and upload it!
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </motion.div>
        </AnimatePresence>
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
