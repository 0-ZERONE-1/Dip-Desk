'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ExternalLink, Eye, BookOpen } from 'lucide-react';
import { cn, categoryColor, categoryIcon, formatImageUrl, isImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import PDFViewer from './PDFViewer';

interface ResourceCardProps {
  resource: {
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
  };
  index?: number;
}

export default function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [upvotes, setUpvotes] = useState(resource.upvotes);
  const [downvotes, setDownvotes] = useState(resource.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(resource.userVote ?? null);
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked ?? false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Unique alternating document dealing trajectories
  const angles = [-5, 5, -3, 4, -6, 3];
  const xOffsets = [-45, 45, -30, 35, -40, 25];
  const initialRotate = angles[index % angles.length];
  const initialX = xOffsets[index % xOffsets.length];

  const isBookOrQPOrSyllabus = resource.category === 'Books' || resource.category === 'Model Question Papers' || resource.category === 'Syllabus';
  const formattedCover = resource.coverImage ? formatImageUrl(resource.coverImage) : '';
  const showCoverImage = Boolean(formattedCover && isImageUrl(formattedCover) && !imgError);

  const handleVote = async (vote: 'up' | 'down') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    if (loadingVote) return;
    setLoadingVote(true);

    const prevVote = userVote;
    const newVote = userVote === vote ? null : vote;
    setUserVote(newVote);
    if (vote === 'up') {
      setUpvotes((v) => v + (newVote === 'up' ? 1 : -1));
      if (prevVote === 'down') setDownvotes((v) => v - 1);
    } else {
      setDownvotes((v) => v + (newVote === 'down' ? 1 : -1));
      if (prevVote === 'up') setUpvotes((v) => v - 1);
    }

    try {
      await fetch(`/api/resources/${resource._id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
    } catch {
      setUserVote(prevVote);
      toast.error('Failed to save vote');
    } finally {
      setLoadingVote(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to bookmark resources'); return; }
    if (loadingBookmark) return;
    setLoadingBookmark(true);
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    toast.success(!prev ? 'Bookmarked!' : 'Bookmark removed');

    try {
      await fetch(`/api/resources/${resource._id}/bookmark`, {
        method: 'POST',
      });
    } catch {
      setIsBookmarked(prev);
      toast.error('Failed to update bookmark');
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          x: initialX,
          y: -30,
          rotate: initialRotate,
          scale: 0.84,
          filter: 'blur(6px)',
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          filter: 'blur(0px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 17,
          mass: 0.8,
          delay: index * 0.08,
        }}
        whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="h-full flex flex-col"
      >
        {isBookOrQPOrSyllabus ? (
          /* ========================================================================= */
          /* 3:4 RATIO BOOK / QUESTION PAPER / SYLLABUS CARD LAYOUT                    */
          /* ========================================================================= */
          <div
            className={cn(
              'group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-2.5 sm:p-3 flex flex-col justify-between h-full relative overflow-hidden gap-2 sm:gap-2.5',
              !resource.isActive && 'opacity-60'
            )}
            id={`resource-${resource._id}`}
          >
            {/* Holographic Laser Scanner Light Beam sweep on mount */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '280%', opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                duration: 0.85,
                delay: index * 0.08 + 0.2,
                ease: 'easeInOut',
              }}
              className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-primary-400/25 via-white/70 to-transparent -skew-x-12 pointer-events-none z-30"
            />

            {/* Smooth Rounded Top Accent Gradient Bar blended with card on hover */}
            <div className="absolute top-0 inset-x-5 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20" />

            {/* Ambient Soft Glow in corner on Hover */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            {/* 3:4 Aspect Ratio Cover Container */}
            <div className="w-full aspect-[3/4] relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-surface-100 via-primary-50/40 to-surface-200 border border-surface-200/80 shadow-xs flex items-center justify-center flex-shrink-0 group/cover">
              {showCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formattedCover}
                  alt={resource.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                /* Fallback stylized book / QP / Syllabus cover graphic */
                <div
                  className={cn(
                    'w-full h-full p-3 sm:p-3.5 flex flex-col justify-between text-white relative select-none shadow-inner',
                    resource.category === 'Model Question Papers'
                      ? 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800'
                      : resource.category === 'Syllabus'
                      ? 'bg-gradient-to-br from-rose-700 via-pink-700 to-purple-800'
                      : 'bg-gradient-to-br from-primary-700 via-indigo-700 to-accent-800'
                  )}
                >
                  {/* Spine depth shadow */}
                  <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-white/10 to-transparent pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {resource.category === 'Model Question Papers'
                        ? 'Model QP'
                        : resource.category === 'Syllabus'
                        ? 'Syllabus'
                        : 'Textbook'}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 opacity-80" />
                  </div>

                  <div className="my-auto relative z-10 py-1">
                    <h4 className="text-xs sm:text-sm font-extrabold line-clamp-2 leading-snug drop-shadow-xs">
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-[9px] sm:text-[10px] text-white/80 line-clamp-1 mt-1 leading-tight font-medium">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-white/20 flex items-center justify-between text-[9px] font-bold text-white/80 relative z-10">
                    <span className="truncate">
                      {resource.category === 'Model Question Papers'
                        ? 'Model QP'
                        : resource.category === 'Syllabus'
                        ? 'Syllabus'
                        : 'Books'}
                    </span>
                    <span className="text-white/95 font-black flex-shrink-0 text-[8px]">PDF</span>
                  </div>
                </div>
              )}

              {/* Floating category badge on top right */}
              <span
                className={cn(
                  'absolute top-2 right-2 z-20 badge text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-white/60',
                  resource.category === 'Model Question Papers'
                    ? 'text-amber-700'
                    : resource.category === 'Syllabus'
                    ? 'text-rose-700'
                    : 'text-primary-700'
                )}
              >
                {resource.category === 'Model Question Papers' ? 'Model QP' : resource.category}
              </span>
            </div>

            {/* Book Title & Description */}
            <div className="flex-1 flex flex-col justify-between min-w-0 px-0.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 leading-snug">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-normal">
                    {resource.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-1 pt-2 border-t border-surface-100/90 relative z-10 mt-auto">
              {/* Votes */}
              <div className="flex items-center gap-0.5">
                <button
                  id={`upvote-${resource._id}`}
                  onClick={() => handleVote('up')}
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-bold transition-all duration-200',
                    userVote === 'up'
                      ? 'bg-emerald-100 text-emerald-700 shadow-2xs'
                      : 'bg-surface-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                  )}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{upvotes}</span>
                </button>
                <button
                  id={`downvote-${resource._id}`}
                  onClick={() => handleVote('down')}
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-bold transition-all duration-200',
                    userVote === 'down'
                      ? 'bg-red-100 text-red-700 shadow-2xs'
                      : 'bg-surface-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
                  )}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>{downvotes}</span>
                </button>
              </div>

              <div className="flex-1" />

              {/* Bookmark */}
              <button
                id={`bookmark-${resource._id}`}
                onClick={handleBookmark}
                className={cn(
                  'p-1 rounded-lg transition-all duration-200',
                  isBookmarked
                    ? 'text-primary-600 bg-primary-50 shadow-2xs'
                    : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                )}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              >
                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>

              {/* Preview */}
              <button
                id={`preview-${resource._id}`}
                onClick={() => setPdfOpen(true)}
                className="p-1 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                title="Preview Book"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Open */}
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                id={`open-${resource._id}`}
                className="btn-primary py-1 px-2.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 hover:scale-105 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open</span>
              </a>
            </div>

            {!resource.isActive && (
              <p className="text-[10px] text-red-500 font-medium">⚠️ Link unavailable</p>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* STANDARD RESOURCE CARD LAYOUT (Notes & Lab Manuals)                       */
          /* ========================================================================= */
          <div
            className={cn(
              'group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-3.5 sm:p-4 flex flex-col justify-between h-full relative overflow-hidden gap-3',
              !resource.isActive && 'opacity-60'
            )}
            id={`resource-${resource._id}`}
          >
            {/* Holographic Laser Scanner Light Beam sweep on mount */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '280%', opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                duration: 0.8,
                delay: index * 0.08 + 0.2,
                ease: 'easeInOut',
              }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary-400/25 via-white/70 to-transparent -skew-x-12 pointer-events-none z-20"
            />

            {/* Smooth Rounded Top Accent Gradient Bar blended with card on hover */}
            <div className="absolute top-0 inset-x-6 sm:inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10" />

            {/* Ambient Soft Glow in corner on Hover */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            {/* Top Bar with Animated Icon & Badges */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 360,
                  damping: 15,
                  delay: index * 0.08 + 0.16,
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-50 via-primary-100/60 to-primary-100/90 border border-primary-200/60 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 group-hover:scale-105 group-hover:bg-primary-100 group-hover:shadow-md group-hover:shadow-primary-500/15 transition-all duration-300 shadow-2xs"
              >
                {categoryIcon(resource.category)}
              </motion.div>

              <div className="flex items-center flex-shrink-0">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.22, duration: 0.25 }}
                  className={cn(
                    'badge text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs',
                    categoryColor(resource.category)
                  )}
                >
                  {resource.category}
                </motion.span>
              </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0 relative z-10 my-0.5">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2">
                {resource.title}
              </h3>
              {resource.description ? (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1 italic">
                  Verified study material for diploma students
                </p>
              )}
            </div>

            {/* Footer with touch-friendly actions */}
            <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-surface-100/90 relative z-10 mt-auto">
              {/* Votes */}
              <div className="flex items-center gap-1 bg-surface-50/80 p-0.5 rounded-xl border border-surface-200/60">
                <button
                  id={`upvote-${resource._id}`}
                  onClick={() => handleVote('up')}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200',
                    userVote === 'up'
                      ? 'bg-emerald-100 text-emerald-700 shadow-2xs'
                      : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{upvotes}</span>
                </button>
                <button
                  id={`downvote-${resource._id}`}
                  onClick={() => handleVote('down')}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200',
                    userVote === 'down'
                      ? 'bg-red-100 text-red-700 shadow-2xs'
                      : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{downvotes}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  id={`bookmark-${resource._id}`}
                  onClick={handleBookmark}
                  className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isBookmarked
                      ? 'text-primary-600 bg-primary-50 shadow-2xs'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                  )}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>

                <button
                  id={`preview-${resource._id}`}
                  onClick={() => setPdfOpen(true)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`open-${resource._id}`}
                  className="btn-primary py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </a>
              </div>
            </div>

            {!resource.isActive && (
              <p className="text-xs text-red-500 font-medium">⚠️ This link may be broken or unavailable</p>
            )}
          </div>
        )}
      </motion.div>

      <PDFViewer url={resource.url} title={resource.title} open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </>
  );
}
