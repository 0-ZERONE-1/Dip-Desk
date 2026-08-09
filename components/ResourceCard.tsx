'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ExternalLink, Eye } from 'lucide-react';
import { cn, categoryColor, categoryIcon, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import PDFViewer from './PDFViewer';

interface ResourceCardProps {
  resource: {
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
  };
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [upvotes, setUpvotes] = useState(resource.upvotes);
  const [downvotes, setDownvotes] = useState(resource.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(resource.userVote ?? null);
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked ?? false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const handleVote = async (vote: 'up' | 'down') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    if (loadingVote) return;
    setLoadingVote(true);

    const prevVote = userVote;
    // Optimistic update
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
      // Revert on error
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
      <div
        className={cn(
          'card-hover p-4 flex flex-col gap-3 group',
          !resource.isActive && 'opacity-60'
        )}
        id={`resource-${resource._id}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
            {categoryIcon(resource.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                {resource.title}
              </h3>
              <span className={cn('badge flex-shrink-0 text-xs', categoryColor(resource.category))}>
                {resource.category}
              </span>
            </div>
            {resource.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-100">
          {/* Votes */}
          <div className="flex items-center gap-1">
            <button
              id={`upvote-${resource._id}`}
              onClick={() => handleVote('up')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                userVote === 'up'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-surface-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {upvotes}
            </button>
            <button
              id={`downvote-${resource._id}`}
              onClick={() => handleVote('down')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                userVote === 'down'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-surface-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
              )}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {downvotes}
            </button>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button
            id={`bookmark-${resource._id}`}
            onClick={handleBookmark}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-150',
              isBookmarked
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
            )}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button
            id={`preview-${resource._id}`}
            onClick={() => setPdfOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            id={`open-${resource._id}`}
            className="btn-primary py-1.5 px-3 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </div>

        {!resource.isActive && (
          <p className="text-xs text-red-500 font-medium">⚠️ This link may be broken or unavailable</p>
        )}
      </div>

      <PDFViewer url={resource.url} title={resource.title} open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </>
  );
}
