'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2, Pin, Bell, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notice {
  _id: string;
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'Urgent' | 'General';
  isPinned: boolean;
  isActive: boolean;
  link?: string;
  createdAt: string;
}

const emptyForm: {
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'Urgent' | 'General';
  isPinned: boolean;
  link: string;
} = {
  title: '',
  content: '',
  badge: 'Important',
  isPinned: false,
  link: '',
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetch('/api/notices').then((r) => r.json());
    setNotices(data.notices || []);
    setLoading(false);
  };

  const handleEdit = (n: Notice) => {
    setEditId(n._id);
    setForm({
      title: n.title,
      content: n.content,
      badge: n.badge || 'Important',
      isPinned: !!n.isPinned,
      link: n.link || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/notices/${editId}` : '/api/notices';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }

      toast.success(editId ? 'Notice updated!' : 'Notice created!');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Notice deleted');
      load();
    } catch {
      toast.error('Could not delete notice');
    }
  };

  const togglePin = async (notice: Notice) => {
    try {
      await fetch(`/api/notices/${notice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !notice.isPinned }),
      });
      toast.success(notice.isPinned ? 'Unpinned notice' : 'Pinned notice to top!');
      load();
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" /> Manage Notices
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Post, edit, or remove announcements and exam notices displayed on the home page.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Notice
        </button>
      </div>

      {/* Notice Create/Edit Modal Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-primary-200 shadow-modal">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-200">
            <h2 className="font-bold text-gray-900 text-lg">
              {editId ? 'Edit Notice' : 'New Notice'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="btn-ghost p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                placeholder="e.g. End Semester Exam Schedule Announced"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Tag</label>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value as any })}
                className="input"
              >
                <option value="Important">Important (Purple)</option>
                <option value="Exam">Exam (Amber)</option>
                <option value="Update">Update (Blue)</option>
                <option value="Urgent">Urgent (Red)</option>
                <option value="General">General (Gray)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                External / Related Link (optional)
              </label>
              <input
                type="text"
                placeholder="https://example.com/routine.pdf"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Notice Content / Details *
              </label>
              <textarea
                rows={3}
                placeholder="Write full announcement details..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-notice"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="pin-notice" className="text-xs font-medium text-gray-700 cursor-pointer">
                Pin this notice to the top of the Notice Board
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-surface-100">
            <button onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">No Notices Published</h3>
          <p className="text-xs text-gray-400 mb-4">Click below to create your first announcement</p>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(emptyForm);
            }}
            className="btn-primary inline-flex"
          >
            <Plus className="w-4 h-4" /> Add Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n._id}
              className={`card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                n.isPinned ? 'border-amber-200 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <button
                    onClick={() => togglePin(n)}
                    title={n.isPinned ? 'Unpin Notice' : 'Pin Notice'}
                    className={`p-1 rounded-lg transition-colors ${
                      n.isPinned
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-surface-100 text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                    {n.badge}
                  </span>
                  {n.createdAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">{n.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.content}</p>

                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1.5"
                  >
                    {n.link} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleEdit(n)}
                  className="btn-ghost p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
                  title="Edit Notice"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="btn-ghost p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
