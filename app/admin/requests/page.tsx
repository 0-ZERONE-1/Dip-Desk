'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import { formatDate } from '@/lib/utils';

interface Request {
  _id: string;
  category: string;
  description: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  department?: string;
  semester?: string;
  subjectTitle?: string;
  url?: string;
  studentEmail?: string;
  studentId?: any;
  subjectId?: any;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    fetch(`/api/admin/requests?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        setRequests(d.requests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const updateStatus = async (id: string, status: string, adminNote: string = '') => {
    const res = await fetch('/api/admin/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNote }),
    });
    if (res.ok) {
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status, adminNote } : r))
      );
      toast.success(`Marked as ${status}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const isPending = (s: string) => s?.toLowerCase() === 'pending';
  const isFulfilled = (s: string) => s?.toLowerCase() === 'fulfilled' || s?.toLowerCase() === 'approved';
  const isRejected = (s: string) => s?.toLowerCase() === 'rejected';

  const pendingCount = requests.filter((r) => isPending(r.status)).length;
  const fulfilledCount = requests.filter((r) => isFulfilled(r.status)).length;
  const rejectedCount = requests.filter((r) => isRejected(r.status)).length;

  const filtered = requests.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return isPending(r.status);
    if (filter === 'Fulfilled') return isFulfilled(r.status);
    if (filter === 'Rejected') return isRejected(r.status);
    return true;
  });

  const getStatusBadge = (s: string) => {
    if (isPending(s)) return { icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, badge: 'badge-warning', text: 'Pending ⏳' };
    if (isFulfilled(s)) return { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, badge: 'badge-success', text: 'Fulfilled ✓' };
    return { icon: <XCircle className="w-3.5 h-3.5 text-red-500" />, badge: 'badge-danger', text: 'Rejected ✕' };
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
            Manage Requests
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {pendingCount} pending · {fulfilledCount} fulfilled · {rejectedCount} rejected · {requests.length} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { label: 'Pending', count: pendingCount },
          { label: 'Fulfilled', count: fulfilledCount },
          { label: 'Rejected', count: rejectedCount },
          { label: 'All', count: requests.length },
        ].map(({ label, count }) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all duration-200 ${
              filter === label
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                : 'bg-white text-gray-600 border border-surface-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <GenericLottieLoader text="Loading Requests..." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const st = getStatusBadge(r.status);
            const deptName = r.department || r.subjectId?.departmentId?.name;
            const semName = r.semester || (r.subjectId?.semesterNumber ? `Semester ${r.subjectId.semesterNumber}` : '');
            const studentInfo =
              typeof r.studentId === 'object' && r.studentId?.email
                ? `${r.studentId.name} (${r.studentId.email})`
                : r.studentEmail || 'Student User';

            return (
              <div key={r._id} id={`request-${r._id}`} className="card p-5 border border-surface-200/80 shadow-sm hover:shadow-card transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const fullTitle = r.subjectTitle || r.subjectId?.name || 'Resource Request';
                      const parts = fullTitle.split(' - ');
                      const subjectName = parts.length > 1 ? parts[0] : null;
                      const mainTitle = parts.length > 1 ? parts.slice(1).join(' - ') : fullTitle;

                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {st.icon}
                            <span className={`badge ${st.badge}`}>{st.text}</span>
                            <span className="badge bg-primary-50 text-primary-700 border-primary-200">{r.category}</span>
                            {deptName && <span className="bg-surface-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-lg">{deptName}</span>}
                            {semName && <span className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold px-2.5 py-0.5 rounded-lg">{semName}</span>}
                            {subjectName && r.category !== 'Subject Request' && !subjectName.toLowerCase().startsWith('semester') && (
                              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                                {subjectName}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-gray-900 mb-1.5 break-words">
                            {mainTitle}
                          </h3>
                        </div>
                      );
                    })()}

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 font-medium bg-surface-50 p-2.5 rounded-xl border border-surface-200/70">{r.description}</p>

                    {r.url && (
                      <div className="mb-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
                        >
                          🔗 Source Link: {r.url}
                        </a>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 space-y-0.5 pt-2 border-t border-surface-100">
                      <p>👤 Submitted by: <span className="font-semibold text-gray-700">{studentInfo}</span></p>
                      <p>🕐 Date: {r.createdAt ? formatDate(r.createdAt) : 'N/A'}</p>
                    </div>
                  </div>

                  {isPending(r.status) && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        id={`fulfill-${r._id}`}
                        onClick={() => updateStatus(r._id, 'Fulfilled')}
                        className="btn-secondary py-1.5 px-3 text-xs text-emerald-700 bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100 transition-all font-semibold rounded-xl flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Fulfill
                      </button>
                      <button
                        id={`reject-${r._id}`}
                        onClick={() => updateStatus(r._id, 'Rejected')}
                        className="btn-secondary py-1.5 px-3 text-xs text-red-700 bg-red-50/80 border-red-200/80 hover:bg-red-100 transition-all font-semibold rounded-xl flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="card p-12 text-center text-gray-400">
              No {filter.toLowerCase()} requests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
