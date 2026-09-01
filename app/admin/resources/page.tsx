'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, RotateCcw, BookOpen, ExternalLink, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, formatImageUrl, isImageUrl } from '@/lib/utils';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';

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
  subjectId?: Subject | string | null;
  departmentId?: Department | string | null;
  semesterNumber?: number | null;
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
  subjectId: 'COMMON',
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
  const [formSem, setFormSem] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const requiresCoverImage = true;

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
    if (form.subjectId === 'COMMON' && (!formDept || !formSem)) {
      toast.error('Department and Semester are required for Semester-Level Resources');
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

      const body: any = {
        ...form,
        title: sanitizeText(form.title).trim(),
        description: sanitizeOneLineText(form.description).trim(),
        url: normalizedUrl,
        coverImage: normalizedCover,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (form.subjectId === 'COMMON') {
        body.departmentId = formDept;
        body.semesterNumber = formSem;
      }

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
      setFormSem('');
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
    let dIdToSet = '';
    
    if (!r.subjectId) {
      const depObj = r.departmentId;
      dIdToSet = typeof depObj === 'object' && depObj !== null ? (depObj as any)._id : String(depObj || '');
      if (dIdToSet) setFormDept(dIdToSet);
      if (r.semesterNumber) setFormSem(String(r.semesterNumber));
    } else {
      const subObj = getSubjectObj(r.subjectId, subjects);
      if (subObj) {
        const dId = typeof subObj.departmentId === 'object' ? subObj.departmentId?._id : subObj.departmentId;
        if (dId) { dIdToSet = String(dId); setFormDept(dIdToSet); }
      }
    }

    setForm({
      title: r.title,
      description: r.description || '',
      url: r.url,
      coverImage: r.coverImage || '',
      category: r.category,
      subjectId: r.subjectId ? subIdStr : 'COMMON',
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

  const toggleActive = async (r: Resource) => {
    const updatedActive = r.isActive === false ? true : false;
    setResources((prev) =>
      prev.map((item) => (item._id === r._id ? { ...item, isActive: updatedActive } : item))
    );
    try {
      await fetch(`/api/resources/${r._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedActive }),
      });
      saveClientCustomItem('resources', { ...r, isActive: updatedActive });
      toast.success(updatedActive ? 'Resource activated (visible to students)' : 'Resource deactivated (hidden from students)');
    } catch {
      toast.error('Failed to update active status');
      loadAll();
    }
  };

  // Filtered resources list
  const filtered = resources.filter((r) => {
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterStatus === 'active' && r.isActive === false) return false;
    if (filterStatus === 'inactive' && r.isActive !== false) return false;

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
    if (formDept && formDept !== 'all') {
      const dId = typeof s.departmentId === 'object' ? s.departmentId?._id : s.departmentId;
      if (dId !== formDept) return false;
    }
    if (formSem && s.semesterNumber !== Number(formSem)) return false;
    return true;
  });

  const filteredFilterSubjects = subjects.filter((s) => {
    if (filterDept && filterDept !== 'all') {
      const dId = typeof s.departmentId === 'object' ? s.departmentId?._id : s.departmentId;
      if (dId !== filterDept && dId !== 'all') return false;
    }
    if (filterSem && s.semesterNumber !== Number(filterSem)) return false;
    return true;
  });

  const hasActiveFilters = Boolean(filterCategory || filterDept || filterSem || filterSubject || filterStatus);

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDept('');
    setFilterSem('');
    setFilterSubject('');
    setFilterStatus('');
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
        <AnimatedSelect
          id="filter-category"
          value={filterCategory}
          onChange={(val) => setFilterCategory(val)}
          options={[
            { value: '', label: 'All Categories' },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          placeholder="All Categories"
          className="min-w-[150px]"
        />

        {/* Department Filter */}
        <AnimatedSelect
          id="filter-dept"
          value={filterDept}
          onChange={(val) => {
            setFilterDept(val);
            setFilterSubject('');
          }}
          options={[
            { value: '', label: 'All Departments' },
            ...departments.map((d) => ({ value: d._id, label: d.name })),
          ]}
          placeholder="All Departments"
          className="min-w-[160px]"
        />

        {/* Semester Filter */}
        <AnimatedSelect
          id="filter-sem"
          value={filterSem}
          onChange={(val) => {
            setFilterSem(val);
            setFilterSubject('');
          }}
          options={[
            { value: '', label: 'All Semesters' },
            ...[1, 2, 3, 4, 5, 6].map((s) => ({ value: String(s), label: `Semester ${s}` })),
          ]}
          placeholder="All Semesters"
          className="min-w-[140px]"
        />

        {/* Subject Filter */}
        <AnimatedSelect
          id="filter-subject"
          value={filterSubject}
          onChange={(val) => setFilterSubject(val)}
          options={[
            { value: '', label: 'All Subjects' },
            ...filteredFilterSubjects.map((s) => ({ value: s._id, label: s.name })),
          ]}
          placeholder="All Subjects"
          className="min-w-[160px]"
        />

        {/* Status / Visibility Filter */}
        <AnimatedSelect
          id="filter-status"
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active (Visible)' },
            { value: 'inactive', label: 'Inactive (Hidden)' },
          ]}
          placeholder="All Status"
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
                    autoComplete="off"
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
                    autoComplete="off"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      Department (filter)
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

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Semester (filter)
                    </label>
                    <select
                      id="resource-sem-filter"
                      value={formSem}
                      onChange={(e) => setFormSem(e.target.value)}
                      className="select"
                    >
                      <option value="">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={String(s)}>
                          Semester {s}
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
                    <option value="COMMON" className="font-bold text-primary-600 bg-primary-50">
                      All Subjects in this Semester
                    </option>
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
        <GenericLottieLoader text="Loading Resources..." />
      ) : (
        <div className="card p-0 overflow-hidden shadow-card border border-surface-200/90 rounded-2xl">
          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-surface-100">
            {filtered.map((r) => {
              const subObj = getSubjectObj(r.subjectId, subjects);
              const subName = subObj?.name || '—';
              const deptName = getDeptName(r.subjectId, subjects, departments);
              const semNum = getSemesterNumber(r.subjectId, subjects);

              return (
                <div key={r._id} className="p-4 space-y-3 hover:bg-primary-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="badge-primary text-[10px] px-2 py-0.5 font-bold">
                          {r.category}
                        </span>
                        {semNum && (
                          <span className="bg-surface-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
                            Sem {semNum}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug break-words">{r.title}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{subName} · {deptName}</p>
                    </div>
                    <button
                      onClick={() => toggleActive(r)}
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all border flex-shrink-0 ${
                        r.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {r.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-100 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-600 font-bold">▲{r.upvotes || 0}</span>
                      <span className="text-rose-500 font-bold">▼{r.downvotes || 0}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-2.5 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(r._id)}
                        className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-surface-50/80 border-b border-surface-200/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5 hidden md:table-cell">Department</th>
                  <th className="py-3.5 px-5 hidden sm:table-cell">Semester</th>
                  <th className="py-3.5 px-5 hidden lg:table-cell">Votes</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100/90 text-xs sm:text-sm">
                {filtered.map((r) => {
                  const subObj = getSubjectObj(r.subjectId, subjects);
                  const subName = subObj?.name || '—';
                  const deptName = getDeptName(r.subjectId, subjects, departments);
                  const semNum = getSemesterNumber(r.subjectId, subjects);

                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-primary-50/30 transition-colors group"
                    >
                      <td className="py-2.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-200 bg-surface-100 shadow-2xs aspect-[3/4]">
                            {r.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/image-proxy?id=${r._id}`}
                                alt={r.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-black text-xs">
                                {r.category === 'Model Question Papers'
                                  ? 'QP'
                                  : r.category === 'Syllabus'
                                  ? 'SY'
                                  : r.category === 'Notes'
                                  ? 'NO'
                                  : r.category === 'Lab Manuals'
                                  ? 'LM'
                                  : 'BK'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-sm sm:text-base truncate max-w-[180px]" title={r.title}>
                              {r.title}
                            </div>
                            {r.description && (
                              <div className="text-[10px] text-gray-400 font-normal truncate max-w-[180px]">
                                {r.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-700 font-semibold whitespace-nowrap">
                        <span className="badge-primary text-xs px-2.5 py-1 font-semibold">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-700 font-medium">{subName}</td>
                      <td className="py-3.5 px-5 text-gray-600 hidden md:table-cell text-xs">{deptName}</td>
                      <td className="py-3.5 px-5 text-gray-600 hidden sm:table-cell text-xs font-medium">
                        {semNum ? `Sem ${semNum}` : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 hidden lg:table-cell text-xs whitespace-nowrap font-mono">
                        <span className="text-emerald-600 font-bold">▲{r.upvotes || 0}</span>{' '}
                        <span className="text-rose-500 font-bold">▼{r.downvotes || 0}</span>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(r)}
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all border ${
                            r.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                          title={r.isActive !== false ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                          {r.isActive !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.url && (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              id={`access-resource-${r._id}`}
                              className="p-1.5 bg-emerald-50/80 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100 rounded-xl transition-all"
                              title="Open Resource"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            id={`toggle-resource-${r._id}`}
                            onClick={() => toggleActive(r)}
                            className={`p-1.5 rounded-xl transition-all border ${
                              r.isActive !== false
                                ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                                : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                            }`}
                            title={r.isActive !== false ? 'Deactivate (Hide from Students)' : 'Activate (Show to Students)'}
                          >
                            {r.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            id={`edit-resource-${r._id}`}
                            onClick={() => handleEdit(r)}
                            className="p-1.5 bg-primary-50/80 text-primary-600 border border-primary-200/80 hover:bg-primary-100 rounded-xl transition-all"
                            title="Edit Resource"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-resource-${r._id}`}
                            onClick={() => setDeleteId(r._id)}
                            className="p-1.5 bg-red-50/80 text-red-600 border border-red-200/80 hover:bg-red-100 rounded-xl transition-all"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
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
