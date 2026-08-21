'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2, Pin, Bell, ExternalLink, RotateCcw, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';

interface Notice {
  _id: string;
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'General';
  isPinned: boolean;
  isActive?: boolean;
  link?: string;
  createdAt?: string;
}

const BADGES = ['Important', 'Exam', 'Update', 'General'] as const;

// Sanitizer for text inputs: Allows letters, numbers, spaces, and basic symbols (., -&/()')
const sanitizeText = (val: string) => {
  return val
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-zA-Z0-9\s.,\-&/()']/g, '');
};

// Sanitizer for multiline content: Strips emojis
const sanitizeContent = (val: string) => {
  return val.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
};

// URL validator
const isValidUrl = (urlStr: string) => {
  if (!urlStr || !urlStr.trim()) return true;
  const trimmed = urlStr.trim();
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(trimmed);
};

// URL normalizer
const normalizeUrl = (urlStr: string) => {
  if (!urlStr || !urlStr.trim()) return '';
  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const getBadgeStyle = (badge: string) => {
  switch (badge) {
    case 'Exam':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Important':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Update':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const emptyForm: {
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'General';
  isPinned: boolean;
  isActive: boolean;
  link: string;
} = {
  title: '',
  content: '',
  badge: 'Important',
  isPinned: false,
  isActive: true,
  link: '',
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [filterBadge, setFilterBadge] = useState('');
  const [filterPin, setFilterPin] = useState('');
  const [filterSort, setFilterSort] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/notices?all=true&t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json());
      const rawList = data.notices || [];
      const formatted = rawList.map((n: Notice) => ({
        ...n,
        isActive: n.isActive ?? true
      }));
      setNotices(syncAndFilterItems<Notice>('notices', formatted));
    } catch {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n: Notice) => {
    setEditId(n._id);
    setForm({
      title: n.title,
      content: n.content,
      badge: n.badge || 'Important',
      isPinned: !!n.isPinned,
      isActive: n.isActive !== false,
      link: n.link || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and Content are required');
      return;
    }

    if (form.link && !isValidUrl(form.link)) {
      toast.error('Please enter a valid URL for the related link');
      return;
    }

    setSaving(true);
    try {
      const normalizedPayload = {
        ...form,
        title: sanitizeText(form.title).trim(),
        content: sanitizeContent(form.content).trim(),
        link: normalizeUrl(form.link),
      };

      const url = editId ? `/api/notices/${editId}` : '/api/notices';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }

      const resData = await res.json().catch(() => null);
      if (resData && (resData._id || resData.notice?._id)) {
        const saved = resData.notice || resData;
        saveClientCustomItem('notices', saved);
      } else {
        saveClientCustomItem('notices', {
          _id: editId || `notice_${Date.now()}`,
          ...normalizedPayload,
          createdAt: new Date().toISOString(),
        });
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
    setDeleteLoading(true);
    addClientDeletedId(id);
    setNotices((prev) => prev.filter((n) => n._id !== id));
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Notice deleted');
      load();
    } catch {
      toast.error('Could not delete notice');
      load();
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const togglePin = async (notice: Notice) => {
    const updatedPin = !notice.isPinned;
    setNotices((prev) =>
      prev.map((n) => (n._id === notice._id ? { ...n, isPinned: updatedPin } : n))
    );
    try {
      await fetch(`/api/notices/${notice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: updatedPin }),
      });
      toast.success(updatedPin ? 'Notice pinned to top' : 'Notice unpinned');
    } catch {
      toast.error('Failed to update pin status');
      load();
    }
  };

  const toggleActive = async (notice: Notice) => {
    const updatedActive = notice.isActive === false ? true : false;
    setNotices((prev) =>
      prev.map((n) => (n._id === notice._id ? { ...n, isActive: updatedActive } : n))
    );
    try {
      await fetch(`/api/notices/${notice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedActive }),
      });
      toast.success(updatedActive ? 'Notice activated (visible to students)' : 'Notice deactivated (hidden from students)');
    } catch {
      toast.error('Failed to update active status');
      load();
    }
  };

  // Filtered and Sorted notices list
  const filtered = notices
    .filter((n) => {
      if (filterBadge && n.badge !== filterBadge) return false;
      if (filterPin === 'pinned' && !n.isPinned) return false;
      if (filterPin === 'unpinned' && n.isPinned) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return filterSort === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const hasActiveFilters = Boolean(filterBadge || filterPin || filterSort !== 'newest');

  const resetFilters = () => {
    setFilterBadge('');
    setFilterPin('');
    setFilterSort('newest');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
              Manage Notices
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading notices...'
              : hasActiveFilters
              ? `Showing ${filtered.length} of ${notices.length} ${notices.length === 1 ? 'Notice' : 'Notices'}`
              : `${notices.length} ${notices.length === 1 ? 'Notice' : 'Notices'}`}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Notice
        </button>
      </div>

      {/* Filter Buttons & Dropdowns Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-5 flex-wrap">
        {/* Category / Badge Tag Filter */}
        <AnimatedSelect
          id="filter-notice-badge"
          value={filterBadge}
          onChange={(val) => setFilterBadge(val)}
          options={[
            { value: '', label: 'All Categories' },
            ...BADGES.map((b) => ({ value: b, label: b })),
          ]}
          placeholder="All Categories"
          className="min-w-[150px]"
        />

        {/* Pin Status Filter */}
        <AnimatedSelect
          id="filter-notice-pin"
          value={filterPin}
          onChange={(val) => setFilterPin(val)}
          options={[
            { value: '', label: 'All Notices' },
            { value: 'pinned', label: 'Pinned Only' },
            { value: 'unpinned', label: 'Unpinned Only' },
          ]}
          placeholder="All Notices"
          className="min-w-[140px]"
        />

        {/* Sort Order */}
        <AnimatedSelect
          id="filter-notice-sort"
          value={filterSort}
          onChange={(val) => setFilterSort(val as any)}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
          ]}
          placeholder="Sort Order"
          className="min-w-[140px]"
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-primary-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-all border border-surface-200"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Notice Create/Edit Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          {/* Outer gradient cap wrapper matching Developer, Department & Subject modals */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Inner modal body with rounded top corners under the top gradient band */}
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold gradient-text">
                    {editId ? 'Edit Notice' : 'Add New Notice'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editId
                      ? 'Update notice announcement and priority tags'
                      : 'Publish a new announcement to the student board'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notice Title <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. End Semester Exam Schedule Announced"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: sanitizeText(e.target.value) })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category Tag</label>
                    <select
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value as any })}
                      className="select"
                    >
                      <option value="Important">Important (Purple)</option>
                      <option value="Exam">Exam (Amber)</option>
                      <option value="Update">Update (Blue)</option>
                      <option value="General">General (Gray)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      External / Related Link <span className="text-[11px] font-normal text-gray-400">(250 CH LIM)</span>
                    </label>
                    <input
                      type="url"
                      maxLength={250}
                      placeholder="https://example.com/routine.pdf"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value.trim() })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notice Content / Details <span className="text-[11px] font-normal text-gray-400">(500 CH LIM)</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    maxLength={500}
                    placeholder="Write full announcement details..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: sanitizeContent(e.target.value) })}
                    className="input py-2.5 resize-none min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="pin-notice"
                      checked={form.isPinned}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded cursor-pointer accent-primary-600"
                    />
                    <label htmlFor="pin-notice" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      Pin to top of Notice Board
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="active-notice"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                    />
                    <label htmlFor="active-notice" className="text-xs font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      Active (Visible to Students)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                    }}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? 'Save Changes' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <GenericLottieLoader text="Loading Notices..." />
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
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">No Notices Found</h3>
          <p className="text-xs text-gray-400 mb-4">No announcements match the selected filter.</p>
          <button onClick={resetFilters} className="btn-secondary inline-flex">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-card ${
                n.isPinned ? 'border-amber-200 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                      n.badge
                    )}`}
                  >
                    {n.badge}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      n.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {n.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  {n.createdAt && (
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                  {n.isPinned && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-700 text-amber-800" /> Pinned
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
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1.5 font-medium"
                  >
                    {n.link} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Actions on the right */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => togglePin(n)}
                  title={n.isPinned ? 'Unpin Notice' : 'Pin Notice to top'}
                  className={`p-2 rounded-xl transition-all border ${
                    n.isPinned
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs hover:bg-amber-600'
                      : 'bg-amber-50/80 text-amber-600 border-amber-200/80 hover:bg-amber-100'
                  }`}
                >
                  <Pin className={`w-4 h-4 ${n.isPinned ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={() => toggleActive(n)}
                  title={n.isActive !== false ? 'Deactivate (Hide from Students)' : 'Activate (Show to Students)'}
                  className={`p-2 rounded-xl transition-all border ${
                    n.isActive !== false
                      ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                      : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                  }`}
                >
                  {n.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(n)}
                  className="p-2 bg-primary-50/80 text-primary-600 border border-primary-200/80 hover:bg-primary-100 rounded-xl transition-all"
                  title="Edit Notice"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(n._id)}
                  className="p-2 bg-red-50/80 text-red-600 border border-red-200/80 hover:bg-red-100 rounded-xl transition-all"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete this notice?"
        description="This will permanently remove the notice. This action cannot be undone."
        itemName={notices.find((n) => n._id === deleteId)?.title}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
