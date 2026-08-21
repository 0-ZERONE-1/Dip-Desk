'use client';
import { useState, useEffect } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface RequestFormProps {
  subjectId: string;
  subjectName: string;
  departmentName?: string;
  semesterNumber?: number;
  defaultCategory: string;
  onClose: () => void;
}

export default function RequestForm({
  subjectId,
  subjectName,
  departmentName,
  semesterNumber,
  defaultCategory,
  onClose,
}: RequestFormProps) {
  const { data: session } = useSession();
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if ((session.user as any).isBanned) {
        setIsBanned(true);
      } else {
        fetch('/api/user/profile')
          .then((r) => r.json())
          .then((data) => {
            if (data.user?.isBanned) setIsBanned(true);
          })
          .catch(() => {});
      }
    }
  }, [session]);

  const formatCatName = (cat: string) => (cat && cat.endsWith('Request') ? cat : `${cat} Request`);

  const [form, setForm] = useState({
    title: '',
    category: defaultCategory ? formatCatName(defaultCategory) : 'Notes Request',
    url: '',
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
      const topicText = form.title.trim() || form.description.slice(0, 30);
      const isSubjectRequest = form.category === 'Subject Request' || defaultCategory === 'Subject Request';
      const fullSubjectTitle = (!isSubjectRequest && subjectName) ? `${subjectName} - ${topicText}` : topicText;

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          subjectTitle: fullSubjectTitle,
          department: departmentName || '',
          semester: semesterNumber ? `Semester ${semesterNumber}` : '',
          category: form.category,
          url: form.url,
          description: form.description,
        }),
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md z-10 my-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {defaultCategory === 'Subject Request' ? 'Request a New Subject' : 'Request a Resource'}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                  {defaultCategory === 'Subject Request' && departmentName
                    ? `${departmentName} · Semester ${semesterNumber}`
                    : `Subject: ${subjectName}`}
                </p>
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
            ) : isBanned ? (
              <div className="text-center py-6 px-2">
                <div className="w-12 h-12 rounded-2xl bg-red-100/80 border border-red-200/90 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-red-900 mb-1">
                  Account Feature Restricted
                </h3>
                <p className="text-xs text-red-600 max-w-xs mx-auto leading-relaxed mb-5">
                  Your account has been suspended by administrators. You are restricted from submitting new requests.
                </p>
                <button onClick={onClose} className="btn-secondary text-xs px-6 py-2 rounded-xl">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      {defaultCategory === 'Subject Request' ? 'Requested Subject Name' : 'Topic Title / Specific Request'}
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{form.title.length}/100</span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={
                      defaultCategory === 'Subject Request'
                        ? 'e.g. Data Structures & Algorithms'
                        : 'e.g. Chapter 3 - Tree Traversals Notes'
                    }
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                {defaultCategory !== 'Subject Request' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Resource Type (Category)
                    </label>
                    <select
                      id="request-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="select text-xs"
                    >
                      {CATEGORIES.map((cat) => {
                        const catVal = formatCatName(cat);
                        return (
                          <option key={cat} value={catVal}>
                            {catVal}
                          </option>
                        );
                      })}
                      <option value="Other Request">Other Request</option>
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Source Link / Reference URL <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{form.url.length}/300</span>
                  </div>
                  <input
                    type="url"
                    maxLength={300}
                    placeholder="https://drive.google.com/... or textbook link"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Description / Details
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{form.description.length}/500</span>
                  </div>
                  <textarea
                    id="request-description"
                    maxLength={500}
                    placeholder="Specify semester, year, or chapter details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="input resize-none text-xs"
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
      </div>
    </AnimatePresence>
  );
}
