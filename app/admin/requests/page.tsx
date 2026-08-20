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
  status: 'Pending' | 'Fulfilled' | 'Rejected';
  adminNote: string;
  createdAt: string;
  studentId: { name: string; email: string };
  subjectId: { name: string; semesterNumber: number; departmentId: { name: string } };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    fetch('/api/admin/requests').then((r) => r.json()).then((d) => {
      setRequests(d.requests || []);
      setTimeout(() => setLoading(false), 2500);
    }).catch(() => setTimeout(() => setLoading(false), 2500));
  }, []);

  const updateStatus = async (id: string, status: string, adminNote: string = '') => {
    const res = await fetch('/api/admin/requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, adminNote }) });
    if (res.ok) {
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: status as any, adminNote } : r));
      toast.success(`Marked as ${status}`);
    }
  };

  const filtered = requests.filter((r) => filter === 'All' || r.status === filter);

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const fulfilledCount = requests.filter((r) => r.status === 'Fulfilled').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  const statusIcon = (s: string) => ({
    Pending: <Clock className="w-4 h-4 text-amber-500" />,
    Fulfilled: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    Rejected: <XCircle className="w-4 h-4 text-red-500" />,
  }[s]);

  const statusBadge = (s: string) => ({
    Pending: 'badge-warning',
    Fulfilled: 'badge-success',
    Rejected: 'badge-danger',
  }[s] || 'badge');

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
          {filtered.map((r) => (
            <div key={r._id} id={`request-${r._id}`} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {statusIcon(r.status)}
                    <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                    <span className="badge bg-primary-50 text-primary-700 border-primary-200">{r.category}</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{r.description}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>📚 {r.subjectId?.departmentId?.name} · Sem {r.subjectId?.semesterNumber} · {r.subjectId?.name}</p>
                    <p>👤 {r.studentId?.name} ({r.studentId?.email})</p>
                    <p>🕐 {formatDate(r.createdAt)}</p>
                  </div>
                </div>
                {r.status === 'Pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button id={`fulfill-${r._id}`} onClick={() => updateStatus(r._id, 'Fulfilled')} className="btn-secondary py-1.5 px-3 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      <CheckCircle className="w-3.5 h-3.5" /> Fulfill
                    </button>
                    <button id={`reject-${r._id}`} onClick={() => updateStatus(r._id, 'Rejected')} className="btn-secondary py-1.5 px-3 text-xs text-red-700 border-red-200 hover:bg-red-50">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card p-12 text-center text-gray-400">No {filter.toLowerCase()} requests</div>
          )}
        </div>
      )}
    </div>
  );
}
