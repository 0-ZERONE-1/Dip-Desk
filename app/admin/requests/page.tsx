'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
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
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id: string, status: string, adminNote: string = '') => {
    const res = await fetch('/api/admin/requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, adminNote }) });
    if (res.ok) {
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: status as any, adminNote } : r));
      toast.success(`Marked as ${status}`);
    }
  };

  const filtered = requests.filter((r) => filter === 'All' || r.status === filter);

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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Resource Requests</h1>
        <p className="text-gray-500 mt-1">{requests.filter((r) => r.status === 'Pending').length} pending · {requests.length} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['Pending', 'Fulfilled', 'Rejected', 'All'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? 'tab-active' : 'tab-inactive'}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
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
