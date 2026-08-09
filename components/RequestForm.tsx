'use client';
import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface RequestFormProps {
  subjectId: string;
  subjectName: string;
  defaultCategory: string;
  onClose: () => void;
}

export default function RequestForm({ subjectId, subjectName, defaultCategory, onClose }: RequestFormProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    category: defaultCategory,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('Please describe what you need');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success('Request submitted! Admins will review it soon.');
      onClose();
    } catch {
      toast.error('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[61] px-4"
        >
          <div className="bg-white rounded-2xl shadow-modal p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Request a Resource</h2>
                <p className="text-sm text-gray-500 mt-0.5">Subject: {subjectName}</p>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!session ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">You need to sign in to submit a request.</p>
                <Link href="/login" className="btn-primary">Sign In</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Resource Type
                  </label>
                  <select
                    id="request-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="select"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    What do you need?
                  </label>
                  <textarea
                    id="request-description"
                    placeholder="e.g. 2023 model question paper for DBMS, or Unit 3 notes on SQL..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="input resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-request-btn"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
