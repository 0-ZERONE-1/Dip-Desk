'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, Sparkles, ArrowRight, ExternalLink, Calendar, Megaphone } from 'lucide-react';
import { syncAndFilterItems } from '@/lib/clientStore';
import { formatDate } from '@/lib/utils';

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

export default function LatestNoticeSection() {
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/notices?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawList = data.notices || [];
        const synced = syncAndFilterItems<Notice>('notices', rawList);
        const activeOnly = synced.filter((n) => n.isActive !== false);

        // Sort descending by date to get the SINGLE latest notice created
        const sorted = [...activeOnly].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        if (sorted.length > 0) {
          setLatestNotice(sorted[0]);
        } else {
          setLatestNotice(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !latestNotice) return null;

  return (
    <section className="px-4 py-10 relative z-10 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 sm:p-8 bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 border border-primary-200/80 shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
      >
        {/* Glowing Background Blob */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100/80 border border-primary-300 text-xs font-extrabold text-primary-800 shadow-2xs">
                <Megaphone className="w-3.5 h-3.5 text-primary-600 animate-bounce" />
                <span>Latest Announcement</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </span>

              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badgeStyles[latestNotice.badge] || badgeStyles.General}`}>
                {latestNotice.badge}
              </span>

              <span className="text-xs text-gray-500 flex items-center gap-1 font-medium ml-auto md:ml-0">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {latestNotice.createdAt ? formatDate(latestNotice.createdAt) : 'Recently Posted'}
              </span>
            </div>

            {/* Notice Title */}
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
              {latestNotice.title}
            </h3>

            {/* Notice Content */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {latestNotice.content}
            </p>

            {/* Notice Link if available */}
            {latestNotice.link && (
              <a
                href={latestNotice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Official Link / Document
              </a>
            )}
          </div>

          {/* Action CTA Button */}
          <div className="flex-shrink-0 flex items-center md:flex-col justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-surface-200/80 md:pl-6">
            <Link href="/notices" className="btn-primary w-full sm:w-auto text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm">
              <span>View All Notices</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
