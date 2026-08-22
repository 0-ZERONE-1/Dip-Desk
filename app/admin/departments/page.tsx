'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Building2, GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatImageUrl, isImageUrl } from '@/lib/utils';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import GenericLottieLoader from '@/components/GenericLottieLoader';

interface Department {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  isActive?: boolean;
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  isActive: true,
};

// Sanitizer for text inputs: Allows letters, numbers, spaces, and basic symbols (., -&/()')
const sanitizeText = (val: string) => {
  return val
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-zA-Z0-9\s.,\-&/()']/g, '');
};

// Sanitizer for single continuous text: Strips newlines, emojis, and unwanted symbols
const sanitizeDescription = (val: string) => {
  return val
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
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

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/departments?all=true&t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json());
      setDepartments(syncAndFilterItems<Department>('departments', data.departments || []));
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (d: Department) => {
    setEditId(d._id);
    setForm({
      name: d.name || '',
      slug: d.slug || '',
      description: d.description || '',
      icon: d.icon || '',
      isActive: d.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Department Name is required');
      return;
    }

    if (form.icon && !isValidUrl(form.icon) && !isImageUrl(form.icon) && form.icon.length > 4) {
      toast.error('Please enter a valid Icon URL (e.g. https://example.com/icon.png)');
      return;
    }

    setSaving(true);
    try {
      const cleanSlug = (form.slug || form.name)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');

      const normalizedPayload = {
        name: sanitizeText(form.name).trim(),
        slug: cleanSlug,
        description: sanitizeDescription(form.description).trim(),
        icon: isImageUrl(form.icon) ? normalizeUrl(form.icon) : form.icon.trim(),
        isActive: form.isActive,
      };

      const url = editId ? `/api/departments/${editId}` : '/api/departments';
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
      if (resData && (resData._id || resData.department?._id)) {
        saveClientCustomItem('departments', resData.department || resData);
      } else {
        saveClientCustomItem('departments', {
          _id: editId || `dept_${Date.now()}`,
          ...normalizedPayload,
        });
      }

      toast.success(editId ? 'Department updated!' : 'Department created!');
      setShowModal(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      addClientDeletedId(id);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      toast.success('Department deleted');
    } catch {
      toast.error('Failed to delete department');
      load();
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (d: Department) => {
    const updatedActive = d.isActive === false ? true : false;
    setDepartments((prev) =>
      prev.map((item) => (item._id === d._id ? { ...item, isActive: updatedActive } : item))
    );
    try {
      await fetch(`/api/departments/${d._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedActive }),
      });
      toast.success(updatedActive ? 'Department activated (visible to students)' : 'Department deactivated (hidden from students)');
    } catch {
      toast.error('Failed to update active status');
      load();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
              Manage Departments
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading departments...'
              : `${departments.length} ${departments.length === 1 ? 'Department' : 'Departments'}`}
          </p>
        </div>
        <button
          id="add-dept-btn"
          onClick={openAddModal}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Department
        </button>
      </div>

      {/* Departments List Grid */}
      {loading ? (
        <GenericLottieLoader text="Loading Departments..." />
      ) : departments.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Departments Added</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">Click below to add your first academic department.</p>
          <button onClick={openAddModal} className="btn-primary mx-auto">
            Add Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div
              key={d._id}
              className="card p-6 flex flex-col justify-between relative group shadow-sm hover:shadow-card transition-all border border-surface-200 min-w-0"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden aspect-square">
                      {isImageUrl(d.icon) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formatImageUrl(d.icon)}
                          alt={d.name}
                          className="w-full h-full object-cover rounded-2xl shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#c026d3] flex items-center justify-center text-white shadow-md shadow-primary-500/25">
                          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-xs" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            d.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {d.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight break-words [overflow-wrap:anywhere]">
                        {d.name}
                      </h3>
                      <p className="text-xs text-primary-600 font-medium mt-1">/browse/{d.slug}</p>
                    </div>
                  </div>
                </div>

                {d.description ? (
                  <p className="text-xs text-gray-500 line-clamp-3 break-words [overflow-wrap:anywhere] leading-relaxed mb-4">
                    {d.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-4">No description provided</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-100 mt-auto">
                <span className="text-[11px] font-semibold text-gray-400">Department</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleActive(d)}
                    className={`p-1.5 rounded-xl transition-all border ${
                      d.isActive !== false
                        ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                        : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                    }`}
                    title={d.isActive !== false ? 'Deactivate (Hide from Students)' : 'Activate (Show to Students)'}
                  >
                    {d.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    id={`edit-dept-${d._id}`}
                    onClick={() => openEditModal(d)}
                    className="p-1.5 bg-primary-50/80 text-primary-600 border border-primary-200/80 hover:bg-primary-100 rounded-xl transition-all"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`delete-dept-${d._id}`}
                    onClick={() => setDeleteId(d._id)}
                    className="p-1.5 bg-red-50/80 text-red-600 border border-red-200/80 hover:bg-red-100 rounded-xl transition-all"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with curved gradient cap */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          {/* Outer gradient cap wrapper matching the reference drawing */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Inner modal body with rounded top corners under the top gradient band */}
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold gradient-text">
                    {editId ? 'Edit Department' : 'Add New Department'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editId
                      ? 'Update department name, description, and icon'
                      : 'Create a new department for student resources'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department Name * <span className="text-[11px] font-normal text-gray-400">(50 CH LIM)</span>
                    </label>
                    <input
                      id="dept-name"
                      type="text"
                      required
                      autoComplete="off"
                      maxLength={50}
                      placeholder="e.g. Computer Science & Technology"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: sanitizeText(e.target.value) })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      URL Slug / Code <span className="text-[11px] font-normal text-gray-400">(Auto-generated if empty)</span>
                    </label>
                    <input
                      id="dept-slug"
                      type="text"
                      autoComplete="off"
                      maxLength={50}
                      placeholder="e.g. cst or computer-science"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') })}
                      className="input font-mono text-xs"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      URL Path: /browse/{(form.slug || form.name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'slug'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department Description <span className="text-[11px] font-normal text-gray-400">(150 CH LIM)</span>
                  </label>
                  <textarea
                    id="dept-desc"
                    rows={4}
                    maxLength={150}
                    placeholder="Brief description about this department and subjects (shown on browse cards)..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: sanitizeDescription(e.target.value) })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className="input py-2.5 resize-none min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department Icon Image URL <span className="text-[11px] font-normal text-gray-400">(Optional - 250 CH LIM)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 aspect-square">
                      {isImageUrl(form.icon) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formatImageUrl(form.icon)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-2xl shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#c026d3] flex items-center justify-center text-white shadow-md shadow-primary-500/25">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      maxLength={250}
                      placeholder="Paste image link (leave blank for theme gradient icon)..."
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value.trim() })}
                      className="input flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="active-dept"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="active-dept" className="text-xs font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    Active (Visible to Students on Browse Page)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                    }}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-dept-btn"
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? 'Save Changes' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete this department?"
        description="All associated subjects and resources may become inaccessible. This cannot be undone."
        itemName={departments.find((d) => d._id === deleteId)?.name}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
