'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Bell, Pin, ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { filterClientDeleted } from '@/lib/clientStore';

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

const badgeStyles: Record<string, string> = {
  Urgent: 'bg-red-50 text-red-700 border-red-200',
  Exam: 'bg-amber-50 text-amber-700 border-amber-200',
  Update: 'bg-blue-50 text-blue-700 border-blue-200',
  Important: 'bg-purple-50 text-purple-700 border-purple-200',
  General: 'bg-gray-50 text-gray-700 border-gray-200',
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
        setNotices(filterClientDeleted(rawList));
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

        {/* Controls: Search & Category Filter Pills */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8 space-y-3 sm:space-y-4">
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

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mr-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedBadge(c)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex-shrink-0 ${
                  selectedBadge === c
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white border border-surface-200 text-gray-600 hover:bg-surface-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No Notices Found</h3>
              <p className="text-xs text-gray-400">
                {search || selectedBadge !== 'All'
                  ? 'Try clearing your search query or filters'
                  : 'No notices published yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {filteredNotices.map((notice, i) => (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`card p-4 sm:p-6 border transition-all duration-200 break-words overflow-hidden ${
                    notice.isPinned
                      ? 'bg-amber-50/30 border-amber-200/90 shadow-xs'
                      : 'bg-white border-surface-200/80 hover:border-primary-200'
                  }`}
                >
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
                          <Pin className="w-3 h-3 fill-amber-700" /> Pinned
                        </span>
                      )}
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          badgeStyles[notice.badge] || badgeStyles.General
                        }`}
                      >
                        {notice.badge}
                      </span>
                    </div>

                    {notice.createdAt && (
                      <span className="text-[11px] sm:text-xs font-medium text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1.5 leading-snug break-words">
                    {notice.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 break-words whitespace-pre-wrap">
                    {notice.content}
                  </p>

                  {notice.link && (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline break-all"
                    >
                      View Related Attachment / Link <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
