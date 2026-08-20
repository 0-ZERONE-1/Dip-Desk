'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Bell, Pin, ExternalLink, Calendar, Search, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncAndFilterItems } from '@/lib/clientStore';
import { cn } from '@/lib/utils';

import dynamic from 'next/dynamic';

const NoticeLottieLoader = dynamic(
  () => import('@/components/NoticeLottieLoader'),
  { ssr: false }
);

interface Notice {
  _id: string;
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'Urgent' | 'General';
  isPinned: boolean;
  isActive: boolean;
  link?: string;
  createdAt: string;
}

const noticeCardThemes: Record<string, {
  border: string;
  glow: string;
  topAccent: string;
  badge: string;
  indicator: string;
}> = {
  Urgent: {
    border: 'border-red-300/90 hover:border-red-500',
    glow: 'hover:shadow-red-500/10',
    topAccent: 'from-red-500/0 via-red-500 to-red-500/0',
    badge: 'bg-red-50 text-red-700 border-red-200',
    indicator: 'bg-red-500',
  },
  Exam: {
    border: 'border-amber-300/90 hover:border-amber-500',
    glow: 'hover:shadow-amber-500/10',
    topAccent: 'from-amber-500/0 via-amber-500 to-amber-500/0',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    indicator: 'bg-amber-500',
  },
  Important: {
    border: 'border-purple-300/90 hover:border-purple-500',
    glow: 'hover:shadow-purple-500/10',
    topAccent: 'from-purple-500/0 via-purple-500 to-purple-500/0',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    indicator: 'bg-purple-500',
  },
  Update: {
    border: 'border-blue-300/90 hover:border-blue-500',
    glow: 'hover:shadow-blue-500/10',
    topAccent: 'from-blue-500/0 via-blue-500 to-blue-500/0',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    indicator: 'bg-blue-500',
  },
  General: {
    border: 'border-slate-300/90 hover:border-slate-400',
    glow: 'hover:shadow-slate-500/10',
    topAccent: 'from-slate-400/0 via-slate-400 to-slate-400/0',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    indicator: 'bg-slate-400',
  },
};

const categories = ['All', 'Important', 'Exam', 'Update', 'Urgent', 'General'];

export default function PublicNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('All');

  useEffect(() => {
    fetch(`/api/notices?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.notices || [];
        setNotices(syncAndFilterItems<Notice>('notices', rawList));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesBadge = selectedBadge === 'All' || n.badge === selectedBadge;
    return matchesSearch && matchesBadge;
  });

  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 py-6 sm:py-10 flex-1 overflow-x-hidden">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 sm:mb-3"
          >
            Notice <span className="gradient-text">Board</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed px-2"
          >
            Stay informed with the latest exam routines, syllabus updates, and department announcements.
          </motion.p>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto w-full">
          {loading ? (
            <NoticeLottieLoader />
          ) : (
            <>
              {/* Controls: Search & Category Filter Pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8 space-y-3 sm:space-y-4"
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl border-surface-200 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                  {categories.map((c) => {
                    const isActive = selectedBadge === c;
                    return (
                      <button
                        key={c}
                        id={`filter-${c.toLowerCase()}`}
                        onClick={() => setSelectedBadge(c)}
                        className={cn(
                          'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex-shrink-0 shadow-2xs',
                          isActive
                            ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-500/25 scale-[1.03] border-transparent'
                            : 'bg-white border border-surface-200/90 text-gray-700 hover:bg-surface-100 hover:border-surface-300'
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Notices List */}
              {filteredNotices.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center rounded-3xl">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No Notices Found</h3>
              <p className="text-xs text-gray-400">
                {search || selectedBadge !== 'All'
                  ? 'Try clearing your search query or filters'
                  : 'No notices published yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {filteredNotices.map((notice, i) => {
                  const theme = noticeCardThemes[notice.badge] || noticeCardThemes.General;

                  return (
                    <motion.div
                      key={notice._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                      className={cn(
                        'group bg-white rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 p-3.5 sm:p-5 relative overflow-hidden shadow-card hover:shadow-xl break-words',
                        theme.border,
                        theme.glow,
                        notice.isPinned && 'bg-gradient-to-br from-amber-50/40 via-white to-white'
                      )}
                      id={`notice-${notice._id}`}
                    >
                      {/* Top Accent Gradient Bar on Hover */}
                      <div
                        className={cn(
                          'absolute top-0 inset-x-6 sm:inset-x-8 h-[3px] bg-gradient-to-r rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none',
                          theme.topAccent
                        )}
                      />

                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {notice.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                              <Pin className="w-3 h-3 fill-amber-800" /> Pinned
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs',
                              theme.badge
                            )}
                          >
                            {notice.badge}
                          </span>
                        </div>

                        {notice.createdAt && (
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5 leading-snug break-words">
                        {notice.title}
                      </h2>

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3.5 break-words whitespace-pre-wrap">
                        {notice.content}
                      </p>

                      {/* Link */}
                      {notice.link && (
                        <div className="pt-2.5 border-t border-surface-100">
                          <a
                            href={notice.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline break-all group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>View Related Attachment / Link</span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  </main>
    </>
  );
}
