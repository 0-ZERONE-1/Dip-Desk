'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, RotateCcw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, formatImageUrl, isImageUrl } from '@/lib/utils';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface Department {
  _id: string;
  name: string;
  slug: string;
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
  semesterNumber: number;
  departmentId: Department;
}

interface Resource {
  _id: string;
  title: string;
  description?: string;
  url: string;
  coverImage?: string;
  category: string;
  subjectId: Subject | string;
  tags?: string[];
  createdAt: string;
  upvotes?: number;
  downvotes?: number;
  isActive?: boolean;
}

const emptyForm = {
  title: '',
  description: '',
  url: '',
  coverImage: '',
  category: 'Notes',
  subjectId: '',
  tags: '',
};

// Sanitizer for text inputs: Allows letters, numbers, spaces, and basic symbols (., -&/()')
const sanitizeText = (val: string) => {
  return val
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-zA-Z0-9\s.,\-&/()']/g, '');
};

// Sanitizer for single continuous text: Strips newlines, emojis, and unwanted symbols
const sanitizeOneLineText = (val: string) => {
  return val
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-zA-Z0-9\s.,\-&/()']/g, '');
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

const getSubjectIdStr = (subjectId: any) => {
  if (!subjectId) return '';
  if (typeof subjectId === 'string') return subjectId;
  return subjectId._id || subjectId.id || '';
};

const getSubjectObj = (subjectId: any, subjectsList: Subject[]) => {
  if (!subjectId) return null;
  if (typeof subjectId === 'object' && subjectId !== null) return subjectId;
  const idStr = String(subjectId);
  return subjectsList.find((s) => s._id === idStr || s.slug === idStr) || null;
};

const getDeptName = (subjectId: any, subjectsList: Subject[], deptsList: Department[]) => {
  const subObj = getSubjectObj(subjectId, subjectsList);
  if (!subObj) return '—';
  if (typeof subObj.departmentId === 'object' && subObj.departmentId?.name) {
    return subObj.departmentId.name;
  }
  const deptIdStr = typeof subObj.departmentId === 'string' ? subObj.departmentId : '';
  const deptFound = deptsList.find((d) => d._id === deptIdStr || d.slug === deptIdStr);
  return deptFound ? deptFound.name : (deptIdStr || '—');
};

const getDeptId = (subjectId: any, subjectsList: Subject[]) => {
  const subObj = getSubjectObj(subjectId, subjectsList);
  if (!subObj) return '';
  if (typeof subObj.departmentId === 'object' && subObj.departmentId?._id) {
    return String(subObj.departmentId._id);
  }
  return String(subObj.departmentId || '');
};

const getSemesterNumber = (subjectId: any, subjectsList: Subject[]) => {
  const subObj = getSubjectObj(subjectId, subjectsList);
  return subObj?.semesterNumber || null;
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formDept, setFormDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const requiresCoverImage = ['Books', 'Model Question Papers', 'Syllabus'].includes(form.category);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const t = Date.now();
    try {
      const [resData, subData, deptData] = await Promise.all([
        fetch(`/api/resources?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/subjects?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      ]);

      const rawResources = Array.isArray(resData) ? resData : resData.resources || [];
      const rawSubjects = Array.isArray(subData) ? subData : subData.subjects || [];
      const rawDepts = Array.isArray(deptData) ? deptData : deptData.departments || [];

      setResources(syncAndFilterItems<Resource>('resources', rawResources));
      setSubjects(syncAndFilterItems<Subject>('subjects', rawSubjects));
      setDepartments(syncAndFilterItems<Department>('departments', rawDepts));
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim() || !form.url.trim() || !form.subjectId) {
      toast.error('Title, URL, and Subject are required');
      return;
    }

    if (!isValidUrl(form.url)) {
      toast.error('Please enter a valid Resource URL (e.g. https://drive.google.com/...)');
      return;
    }

    if (requiresCoverImage && form.coverImage && !isValidUrl(form.coverImage)) {
      toast.error('Please enter a valid Cover Image URL (e.g. https://example.com/cover.jpg)');
      return;
    }

    setSaving(true);
    try {
      const normalizedUrl = normalizeUrl(form.url);
      const normalizedCover = requiresCoverImage ? normalizeUrl(form.coverImage) : '';

      const body = {
        ...form,
        title: sanitizeText(form.title).trim(),
        description: sanitizeOneLineText(form.description).trim(),
        url: normalizedUrl,
        coverImage: normalizedCover,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const url = editId ? `/api/resources/${editId}` : '/api/resources';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      const resData = await res.json().catch(() => null);
      const foundSub = subjects.find((s) => s._id === form.subjectId || s.slug === form.subjectId);
      const savedObj = resData?.resource || resData || {
        _id: editId || `res_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      };

      if (foundSub) {
        savedObj.subjectId = foundSub;
      } else if (typeof savedObj.subjectId === 'string') {
        const match = subjects.find((s) => s._id === savedObj.subjectId);
        if (match) savedObj.subjectId = match;
      }

      saveClientCustomItem('resources', savedObj);
      toast.success(editId ? 'Resource updated!' : 'Resource created!');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      loadAll();
    } catch {
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r: Resource) => {
    setEditId(r._id);
    const subIdStr = getSubjectIdStr(r.subjectId);
    const subObj = getSubjectObj(r.subjectId, subjects);
    if (subObj) {
      const dId = typeof subObj.departmentId === 'object' ? subObj.departmentId?._id : subObj.departmentId;
      if (dId) setFormDept(String(dId));
    }
    setForm({
      title: r.title,
      description: r.description || '',
      url: r.url,
      coverImage: r.coverImage || '',
      category: r.category,
      subjectId: subIdStr,
      tags: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    addClientDeletedId(id);
    setResources((prev) => prev.filter((r) => r._id !== id));
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      toast.success('Resource deleted');
      loadAll();
    } catch {
      toast.error('Failed to delete');
      loadAll();
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  // Filtered resources list
  const filtered = resources.filter((r) => {
    if (filterCategory && r.category !== filterCategory) return false;

    const subObj = getSubjectObj(r.subjectId, subjects);
    const subIdStr = subObj ? String(subObj._id || subObj.slug) : String(r.subjectId || '');

    if (filterSubject && subIdStr !== filterSubject) return false;

    if (filterDept) {
      const deptId = getDeptId(r.subjectId, subjects);
      if (deptId !== 'all' && deptId !== filterDept) {
        const foundDept = departments.find((d) => d._id === filterDept || d.slug === filterDept);
        if (!foundDept || (deptId !== foundDept._id && deptId !== foundDept.slug)) {
          return false;
        }
      }
    }

    if (filterSem) {
      const semNum = getSemesterNumber(r.subjectId, subjects);
      if (semNum !== Number(filterSem)) return false;
    }

    return true;
  });

  const filteredFormSubjects = subjects.filter((s) => {
    if (!formDept || formDept === 'all') return true;
    const dId = typeof s.departmentId === 'object' ? s.departmentId?._id : s.departmentId;
    return dId === formDept || dId === 'all';
  });

  const hasActiveFilters = Boolean(filterCategory || filterDept || filterSem || filterSubject);

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDept('');
    setFilterSem('');
    setFilterSubject('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
              Manage Resources
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading resources...'
              : hasActiveFilters
              ? `Showing ${filtered.length} of ${resources.length} ${resources.length === 1 ? 'Resource' : 'Resources'}`
              : `${resources.length} ${resources.length === 1 ? 'Resource' : 'Resources'}`}
          </p>
        </div>
        <button
          id="add-resource-btn"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(emptyForm);
            setFormDept('');
          }}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Resource
        </button>
      </div>

      {/* Filter Buttons & Dropdowns Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-5 flex-wrap">
        {/* Category Filter */}
        <select
          id="filter-category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select text-xs sm:text-sm flex-1 min-w-[130px] max-w-[180px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          id="filter-dept"
          value={filterDept}
          onChange={(e) => {
            setFilterDept(e.target.value);
            setFilterSubject('');
          }}
          className="select text-xs sm:text-sm flex-1 min-w-[140px] max-w-[210px]"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Semester Filter */}
        <select
          id="filter-sem"
          value={filterSem}
          onChange={(e) => {
            setFilterSem(e.target.value);
            setFilterSubject('');
          }}
          className="select text-xs sm:text-sm flex-1 min-w-[110px] max-w-[150px]"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

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

      {/* Upload/Edit Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          {/* Outer gradient cap wrapper matching Developer & Subject modals */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Inner modal body with rounded top corners under the top gradient band */}
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold gradient-text">
                    {editId ? 'Edit Resource' : 'Add New Resource'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editId
                      ? 'Update resource title, link, category, and subject'
                      : 'Upload and share learning resources with students'}
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
                    Resource Title <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                  </label>
                  <input
                    id="resource-title"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Data Structures Complete Lecture Notes"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: sanitizeText(e.target.value) })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Resource URL <span className="text-[11px] font-normal text-gray-400">(250 CH LIM)</span>
                  </label>
                  <input
                    id="resource-url"
                    type="url"
                    required
                    maxLength={250}
                    placeholder="https://drive.google.com/..."
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value.trim() })}
                    className="input"
                  />
                </div>

                {/* Cover image input shown only for categories that need a visual cover (Books, Model Question Papers, Syllabus) */}
                {requiresCoverImage && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Cover Image URL <span className="text-[11px] font-normal text-gray-400">(250 CH LIM)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {form.coverImage && (
                        <div className="w-10 h-14 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {isImageUrl(form.coverImage) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={formatImageUrl(form.coverImage)}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">IMG</span>
                          )}
                        </div>
                      )}
                      <input
                        id="resource-cover-image"
                        type="url"
                        maxLength={250}
                        placeholder="https://images.unsplash.com/... or direct image link"
                        value={form.coverImage || ''}
                        onChange={(e) => setForm({ ...form, coverImage: e.target.value.trim() })}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      id="resource-category"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department (filter subjects)
                    </label>
                    <select
                      id="resource-dept-filter"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="select"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                  <select
                    id="resource-subject"
                    required
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="select"
                  >
                    <option value="">Select subject...</option>
                    {filteredFormSubjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.departmentId?.name || 'All Depts'} · Sem {s.semesterNumber} · {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Resource Description <span className="text-[11px] font-normal text-gray-400">(150 CH LIM)</span>
                  </label>
                  <textarea
                    id="resource-description"
                    rows={3}
                    maxLength={150}
                    placeholder="Brief description about the resource contents..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: sanitizeOneLineText(e.target.value) })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className="input py-2.5 resize-none min-h-[75px]"
                  />
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
                    id="save-resource-btn"
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? 'Save Changes' : 'Create Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resources Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Subject</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Semester</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Votes</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const subObj = getSubjectObj(r.subjectId, subjects);
                  const subName = subObj?.name || '—';
                  const deptName = getDeptName(r.subjectId, subjects, departments);
                  const semNum = getSemesterNumber(r.subjectId, subjects);

                  return (
                    <tr
                      key={r._id}
                      className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px]">
                        <div className="truncate font-semibold text-gray-900">{r.title}</div>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary-600 hover:underline truncate block max-w-[200px]"
                            title={r.url}
                          >
                            {r.url}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">
                        {r.category}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{subName}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">{deptName}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell text-xs font-medium">
                        {semNum ? `Sem ${semNum}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs whitespace-nowrap">
                        <span className="text-emerald-600 font-semibold">▲{r.upvotes || 0}</span>{' '}
                        <span className="text-rose-500 font-semibold">▼{r.downvotes || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-resource-${r._id}`}
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-resource-${r._id}`}
                            onClick={() => setDeleteId(r._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No resources found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete this resource?"
        description="This will permanently remove the resource for all students. This cannot be undone."
        itemName={resources.find((r) => r._id === deleteId)?.title}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
