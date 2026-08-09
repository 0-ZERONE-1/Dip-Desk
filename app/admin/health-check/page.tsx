'use client';
import { useState } from 'react';
import { Heart, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface CheckResult { id: string; url: string; isActive: boolean; }
interface Summary { total: number; active: number; broken: number; }

export default function AdminHealthCheckPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [done, setDone] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    setDone(false);
    setResults([]);
    setSummary(null);
    try {
      const res = await fetch('/api/admin/health-check', { method: 'POST' });
      const data = await res.json();
      setResults(data.results || []);
      setSummary(data.summary);
      setDone(true);
    } catch {
      alert('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Link Health Checker</h1>
        <p className="text-gray-500 mt-1">Verify that all uploaded resource URLs are still accessible</p>
      </div>

      {/* Action card */}
      <div className="card p-8 mb-6 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Run Health Check</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          This will send a request to every resource URL and update its status. It may take a few minutes for large libraries.
        </p>
        <button id="run-health-check-btn" onClick={runCheck} disabled={loading} className="btn-primary mx-auto px-8 py-3">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Checking links...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Start Health Check</>
          )}
        </button>
      </div>

      {/* Summary */}
      {done && summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-5 text-center">
            <p className="text-3xl font-extrabold text-gray-900">{summary.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Links</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-extrabold text-emerald-600">{summary.active}</p>
            <p className="text-sm text-gray-500 mt-1">Active ✅</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-extrabold text-red-600">{summary.broken}</p>
            <p className="text-sm text-gray-500 mt-1">Broken ❌</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
            <h3 className="font-semibold text-gray-900 text-sm">Check Results</h3>
          </div>
          <div className="divide-y divide-surface-100 max-h-96 overflow-y-auto custom-scrollbar">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {r.isActive ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <p className="text-sm text-gray-700 flex-1 truncate">{r.url}</p>
                <span className={r.isActive ? 'badge-success' : 'badge-danger'}>
                  {r.isActive ? 'Active' : 'Broken'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
