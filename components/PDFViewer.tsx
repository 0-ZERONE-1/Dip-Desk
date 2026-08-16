'use client';
import { useState } from 'react';
import { X, ExternalLink, Loader2, FileWarning, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PDFViewerProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

interface EmbedResult {
  embedUrl: string | null;
  directUrl: string;
  isValid: boolean;
}

// Convert various Google Drive / Dropbox / PDF links to embed-friendly URLs and prevent iframe recursion
function toEmbedUrl(rawUrl: string): EmbedResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { embedUrl: null, directUrl: '#', isValid: false };
  }

  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return { embedUrl: null, directUrl: '#', isValid: false };
  }

  // Prepend https:// if user omitted protocol for domain-like strings
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.includes('.') && !trimmed.startsWith('/')) {
      trimmed = `https://${trimmed}`;
    } else {
      // Dummy text or relative path -> not an embeddable external document
      return { embedUrl: null, directUrl: trimmed, isValid: false };
    }
  }

  try {
    const parsed = new URL(trimmed);

    // BLOCK SELF-EMBEDDING: Prevents infinite website loop
    if (typeof window !== 'undefined' && (parsed.host === window.location.host || parsed.origin === window.location.origin)) {
      return { embedUrl: null, directUrl: trimmed, isValid: false };
    }

    // Google Drive: https://drive.google.com/file/d/FILE_ID/view -> embed preview
    const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/) || trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (driveMatch && driveMatch[1]) {
      return {
        embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
        directUrl: trimmed,
        isValid: true,
      };
    }

    // Dropbox: change dl=0 to raw=1
    if (trimmed.includes('dropbox.com')) {
      return {
        embedUrl: trimmed.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1'),
        directUrl: trimmed,
        isValid: true,
      };
    }

    // Direct PDF URL -> Google Docs PDF embedded viewer
    if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.toLowerCase().includes('.pdf?')) {
      return {
        embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`,
        directUrl: trimmed,
        isValid: true,
      };
    }

    // Google Docs / Sheets / Slides view links
    if (trimmed.includes('docs.google.com')) {
      return {
        embedUrl: trimmed.replace(/\/edit.*$/, '/preview'),
        directUrl: trimmed,
        isValid: true,
      };
    }

    // Standard valid external URL -> use Google Docs preview wrapper for documents
    return {
      embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`,
      directUrl: trimmed,
      isValid: true,
    };
  } catch {
    return { embedUrl: null, directUrl: trimmed, isValid: false };
  }
}

export default function PDFViewer({ url, title, open, onClose }: PDFViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const { embedUrl, directUrl, isValid } = toEmbedUrl(url);

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
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[71] bg-white rounded-3xl shadow-modal flex flex-col overflow-hidden border border-surface-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-200/90 bg-surface-50 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{url}</p>
              </div>
              <div className="flex items-center gap-2">
                {directUrl && directUrl !== '#' && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Link
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-surface-200/80 transition-colors"
                  id="pdf-viewer-close"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Frame / Fallback */}
            <div className="flex-1 relative bg-surface-100 flex items-center justify-center overflow-hidden">
              {isValid && embedUrl ? (
                <>
                  {!loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-surface-50/80 backdrop-blur-xs">
                      <Loader2 className="w-9 h-9 text-primary-600 animate-spin" />
                      <p className="text-sm font-semibold text-gray-600">Loading document preview...</p>
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
                </>
              ) : (
                /* Fallback when resource has a placeholder/non-embeddable text link */
                <div className="max-w-md p-8 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                    <FileWarning className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Embedded Preview Not Available</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                      This resource contains an external or placeholder link (<span className="font-mono text-gray-700 bg-surface-200 px-1.5 py-0.5 rounded">{url}</span>) that cannot be previewed in an inline frame.
                    </p>
                  </div>
                  {directUrl && directUrl !== '#' && (
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2.5 px-5 text-sm font-bold shadow-md inline-flex items-center gap-2 mt-2"
                    >
                      <Globe className="w-4 h-4" /> Open Link in New Tab
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
