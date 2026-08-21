'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  title = 'Delete this item?',
  description = 'This action cannot be undone. The item will be permanently removed.',
  itemName,
  confirmText = 'Yes, Delete',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.8 }}
          >
            {/* Red top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

            <div className="p-6 sm:p-7">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Warning Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 text-center mb-1 tracking-tight">
                {title}
              </h2>

              {/* Item name highlight */}
              {itemName && (
                <p className="text-center mb-2">
                  <span className="inline-block bg-red-50 border border-red-100 text-red-600 font-bold text-sm px-3 py-0.5 rounded-lg max-w-xs truncate">
                    &ldquo;{itemName}&rdquo;
                  </span>
                </p>
              )}

              {/* Description */}
              <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
                {description}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-gray-700 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {loading ? 'Processing…' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
