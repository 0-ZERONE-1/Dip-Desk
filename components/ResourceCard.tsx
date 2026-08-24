'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ExternalLink, Eye, BookOpen, AlertTriangle } from 'lucide-react';
import { cn, formatImageUrl, isImageUrl } from '@/lib/utils';
import { saveClientCustomItem, removeClientCustomItem, getClientCustomItems } from '@/lib/clientStore';
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
    ratings?: { userId: string; vote: 'up' | 'down' }[];
  };
  index?: number;
  onVoteChange?: (updatedResource: any) => void;
  onBookmarkChange?: (resourceId: string, isBookmarked: boolean) => void;
}

export default function ResourceCard({
  resource,
  index = 0,
  onVoteChange,
  onBookmarkChange,
}: ResourceCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const computeInitialVote = (): 'up' | 'down' | null => {
    if (resource.userVote !== undefined) return resource.userVote;
    if (user && resource.ratings?.length) {
      const uid = user.id || user.email;
      const matched = resource.ratings.find(
        (r: any) => String(r.userId) === String(uid) || (user.email && String(r.userId).toLowerCase() === user.email.toLowerCase())
      );
      if (matched) return matched.vote;
    }
    return null;
  };

  const computeInitialBookmark = (): boolean => {
    if (resource.isBookmarked !== undefined) return resource.isBookmarked;
    const localBookmarks = getClientCustomItems('bookmarks');
    return localBookmarks.some((b: any) => b._id === resource._id);
  };

  const [upvotes, setUpvotes] = useState(resource.upvotes);
  const [downvotes, setDownvotes] = useState(resource.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(computeInitialVote());
  const [isBookmarked, setIsBookmarked] = useState<boolean>(computeInitialBookmark());
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const computed = computeInitialVote();
    setUserVote(computed);
    setUpvotes(resource.upvotes);
    setDownvotes(resource.downvotes);
    if (resource.isBookmarked !== undefined) {
      setIsBookmarked(resource.isBookmarked);
    } else {
      setIsBookmarked(computeInitialBookmark());
    }
  }, [resource.userVote, resource.ratings, resource.upvotes, resource.downvotes, resource.isBookmarked, user]);

  // Unique alternating document dealing trajectories
  const angles = [-5, 5, -3, 4, -6, 3];
  const xOffsets = [-45, 45, -30, 35, -40, 25];
  const initialRotate = angles[index % angles.length];
  const initialX = xOffsets[index % xOffsets.length];

  const formattedCover = resource.coverImage ? formatImageUrl(resource.coverImage) : '';
  const showCoverImage = Boolean(formattedCover && isImageUrl(formattedCover) && !imgError);

  const handleVote = async (vote: 'up' | 'down') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    if (loadingVote) return;
    setLoadingVote(true);

    const prevVote = userVote;
    const newVote = userVote === vote ? null : vote;
    setUserVote(newVote);

    let nextUp = upvotes;
    let nextDown = downvotes;

    if (vote === 'up') {
      nextUp = upvotes + (newVote === 'up' ? 1 : -1);
      setUpvotes(nextUp);
      if (prevVote === 'down') {
        nextDown = Math.max(0, downvotes - 1);
        setDownvotes(nextDown);
      }
    } else {
      nextDown = downvotes + (newVote === 'down' ? 1 : -1);
      setDownvotes(nextDown);
      if (prevVote === 'up') {
        nextUp = Math.max(0, upvotes - 1);
        setUpvotes(nextUp);
      }
    }

    const userIdVal = user.id || user._id || user.email || 'demo_student_id';
    const existingRatings = resource.ratings ? [...resource.ratings] : [];
    const existingIndex = existingRatings.findIndex(
      (r: any) =>
        String(r.userId) === String(userIdVal) ||
        (user.email && String(r.userId).toLowerCase() === user.email.toLowerCase())
    );

    if (newVote === null) {
      if (existingIndex !== -1) existingRatings.splice(existingIndex, 1);
    } else {
      if (existingIndex !== -1) {
        existingRatings[existingIndex] = { userId: userIdVal, vote: newVote };
      } else {
        existingRatings.push({ userId: userIdVal, vote: newVote });
      }
    }

    const updatedResource = {
      ...resource,
      upvotes: nextUp,
      downvotes: nextDown,
      ratings: existingRatings,
      userVote: newVote,
    };

    saveClientCustomItem('resources', updatedResource);
    if (onVoteChange) {
      onVoteChange(updatedResource);
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
    const nextState = !prev;
    setIsBookmarked(nextState);

    if (nextState) {
      saveClientCustomItem('bookmarks', { ...resource, isBookmarked: true });
    } else {
      removeClientCustomItem('bookmarks', resource._id);
    }

    toast.success(nextState ? 'Bookmarked!' : 'Bookmark removed');

    if (onBookmarkChange) {
      onBookmarkChange(resource._id, nextState);
    }

    try {
      await fetch(`/api/resources/${resource._id}/bookmark`, {
        method: 'POST',
      });
    } catch {
      setIsBookmarked(prev);
      if (prev) {
        saveClientCustomItem('bookmarks', { ...resource, isBookmarked: true });
      } else {
        removeClientCustomItem('bookmarks', resource._id);
      }
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
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          filter: 'blur(0px)',
        }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 17,
          mass: 0.8,
          delay: Math.min(index * 0.06, 0.4),
        }}
        whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="h-full flex flex-col"
      >
        {/* ========================================================================= */}
        {/* 3:4 RATIO COVER CARD LAYOUT FOR ALL RESOURCE CATEGORIES                  */}
        {/* ========================================================================= */}
        <div
          className={cn(
            'group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 ease-out p-2.5 sm:p-3 flex flex-col justify-between h-full relative overflow-hidden gap-2 sm:gap-2.5 w-full',
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
              /* Fallback stylized cover graphic */
              <div
                className={cn(
                  'w-full h-full p-3 sm:p-3.5 flex flex-col justify-between text-white relative select-none shadow-inner bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#d946ef]'
                )}
              >
                {/* Spine depth shadow */}
                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-white/10 to-transparent pointer-events-none" />

                <div className="flex items-center justify-end relative z-10">
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
                      : resource.category === 'Notes'
                      ? 'Notes'
                      : resource.category === 'Lab Manuals'
                      ? 'Lab Manual'
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
                  ? 'text-indigo-700'
                  : resource.category === 'Notes'
                  ? 'text-emerald-700'
                  : resource.category === 'Lab Manuals'
                  ? 'text-cyan-700'
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
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              id={`open-${resource._id}`}
              className="btn-primary p-1.5 rounded-lg shadow-xs flex items-center justify-center hover:scale-105 transition-all"
              title="Open resource in new tab"
              aria-label="Open resource"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {!resource.isActive && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
              <span>This link may be broken or unavailable</span>
            </p>
          )}
        </div>
      </motion.div>

      <PDFViewer url={resource.url} title={resource.title} open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </>
  );
}
