'use client';
import { useState } from 'react';
import { X, ExternalLink, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PDFViewerProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

// Convert various Google Drive / Dropbox links to embed-friendly URLs
function toEmbedUrl(url: string): string {
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view -> embed
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  // Dropbox: change dl=0 to raw=1
  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
  }
  // If direct PDF URL, use Google Docs viewer
  if (url.endsWith('.pdf') || url.includes('.pdf?')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
}

export default function PDFViewer({ url, title, open, onClose }: PDFViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = toEmbedUrl(url);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[71] bg-white rounded-2xl shadow-modal flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-200 bg-surface-50 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-400 truncate">{url}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Original
                </a>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-surface-200 transition-colors"
                  id="pdf-viewer-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 relative bg-gray-100">
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading preview...</p>
                </div>
              )}
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                onLoad={() => setLoaded(true)}
                title={title}
                allow="autoplay"
                id="pdf-preview-iframe"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
