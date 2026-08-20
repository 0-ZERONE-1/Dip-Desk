'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2, RotateCcw, BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEMESTERS } from '@/lib/utils';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';

interface Department {
  _id: string;
  name: string;
  slug?: string;
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
  semesterNumber: number;
  description: string;
  departmentId: Department;
}

const emptyForm = {
  name: '',
  semesterNumber: 1,
  departmentId: 'all',
  description: '',
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

const getDeptIdStr = (dept: any) => {
  if (!dept) return '';
  if (typeof dept === 'string') return dept;
  return dept._id || dept.slug || '';
};

const getDeptName = (dept: any, departmentsList: Department[]) => {
  if (!dept) return '';
  if (typeof dept === 'object') {
    if (dept.slug === 'all' || dept._id === 'all' || dept.name === 'All Departments') return 'All Departments';
    if (dept.name) return dept.name;
  }
  const idStr = typeof dept === 'string' ? dept : dept?._id;
  if (idStr === 'all') return 'All Departments';
  const found = departmentsList.find((d) => d._id === idStr || d.slug === idStr);
  return found ? found.name : '';
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const t = Date.now();
    const [subData, deptData] = await Promise.all([
      fetch(`/api/subjects?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setSubjects(syncAndFilterItems<Subject>('subjects', subData.subjects || []));
    setDepartments(syncAndFilterItems<Department>('departments', deptData.departments || []));
    setTimeout(() => setLoading(false), 2500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.departmentId || !form.description.trim()) {
      toast.error('Subject Name, Department, and Description are required');
      return;
    }

    setSaving(true);
    try {
      const normalizedPayload = {
        ...form,
        name: sanitizeText(form.name).trim(),
        description: sanitizeText(form.description).trim(),
      };

      const url = editId ? `/api/subjects/${editId}` : '/api/subjects';
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
      const foundDept = departments.find(
        (d) => d._id === form.departmentId || d.slug === form.departmentId
      );
      const savedObj = resData?.subject || resData || {
        _id: editId || `sub_${Date.now()}`,
        ...normalizedPayload,
        createdAt: new Date().toISOString(),
      };

      if (form.departmentId === 'all') {
        savedObj.departmentId = { _id: 'all', name: 'All Departments', slug: 'all' };
        savedObj.departmentSlug = 'all';
      } else if (foundDept) {
        savedObj.departmentId = foundDept;
        savedObj.departmentSlug = foundDept.slug;
      } else if (typeof savedObj.departmentId === 'string') {
        const match = departments.find(
          (d) => d._id === savedObj.departmentId || d.slug === savedObj.departmentId
        );
        if (match) {
          savedObj.departmentId = match;
          savedObj.departmentSlug = match.slug;
        }
      }

      saveClientCustomItem('subjects', savedObj);
      toast.success(editId ? 'Subject updated!' : 'Subject created!');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Subject) => {
    setEditId(s._id);
    const deptStr = getDeptIdStr(s.departmentId);
    setForm({
      name: s.name,
      semesterNumber: s.semesterNumber,
      departmentId: deptStr === 'all' || !deptStr ? 'all' : deptStr,
      description: s.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    addClientDeletedId(id);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      toast.success('Subject deleted');
      load();
    } catch {
      toast.error('Failed to delete');
      load();
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filtered = subjects.filter((s) => {
    if (filterDept) {
      const sDept = getDeptIdStr(s.departmentId);
      if (sDept !== 'all' && sDept !== filterDept) return false;
    }
    if (filterSem && s.semesterNumber !== parseInt(filterSem)) return false;
    return true;
  });

  const hasActiveFilters = Boolean(filterDept || filterSem);
  const resetFilters = () => {
    setFilterDept('');
    setFilterSem('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center font-bold">
              <BookMarked className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
              Manage Subjects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading subjects...'
              : hasActiveFilters
              ? `Showing ${filtered.length} of ${subjects.length} ${subjects.length === 1 ? 'Subject' : 'Subjects'}`
              : `${subjects.length} ${subjects.length === 1 ? 'Subject' : 'Subjects'}`}
          </p>
        </div>
        <button
          id="add-subject-btn"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Subject
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
        <AnimatedSelect
          id="filter-dept"
          value={filterDept}
          onChange={(val) => setFilterDept(val)}
          options={[
            { value: '', label: 'All Departments' },
            ...departments.map((d) => ({ value: d._id, label: d.name })),
          ]}
          placeholder="All Departments"
          className="min-w-[160px]"
        />
        <AnimatedSelect
          id="filter-sem"
          value={filterSem}
          onChange={(val) => setFilterSem(val)}
          options={[
            { value: '', label: 'All Semesters' },
            ...SEMESTERS.map((s) => ({ value: String(s), label: `Semester ${s}` })),
          ]}
          placeholder="All Semesters"
          className="min-w-[140px]"
        />
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

      {/* Subjects Table */}
      {loading ? (
        <GenericLottieLoader text="Loading Subjects..." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Subject</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Semester</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const deptName = getDeptName(s.departmentId, departments);
                  const isAllDept = deptName === 'All Departments' || getDeptIdStr(s.departmentId) === 'all';
                  return (
                    <tr
                      key={s._id}
                      className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 max-w-md">{s.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {deptName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        Sem {s.semesterNumber}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-subject-${s._id}`}
                            onClick={() => handleEdit(s)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-subject-${s._id}`}
                            onClick={() => setDeleteId(s._id)}
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
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      No subjects found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal with curved gradient cap */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          {/* Outer gradient cap wrapper matching the reference drawing */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Inner modal body with rounded top corners under the top gradient band */}
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold gradient-text">
                    {editId ? 'Edit Subject' : 'Add New Subject'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editId
                      ? 'Update subject curriculum details & semester'
                      : 'Create a new subject under a department and semester'}
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
                    Subject Name <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                  </label>
                  <input
                    id="subject-name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Database Management Systems"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: sanitizeText(e.target.value) })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department
                    </label>
                    <AnimatedSelect
                      id="subject-dept"
                      value={form.departmentId || 'all'}
                      onChange={(val) => setForm({ ...form, departmentId: val })}
                      options={[
                        { value: 'all', label: 'All Departments' },
                        ...departments.map((d) => ({ value: d._id, label: d.name })),
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Semester
                    </label>
                    <AnimatedSelect
                      id="subject-semester"
                      value={form.semesterNumber}
                      onChange={(val) => setForm({ ...form, semesterNumber: parseInt(val) })}
                      options={SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject Description <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                  </label>
                  <textarea
                    id="subject-description"
                    rows={3}
                    required
                    maxLength={100}
                    placeholder="Brief overview of the subject curriculum..."
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
                    id="save-subject-btn"
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? 'Save Changes' : 'Create Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete this subject?"
        description="All resources linked to this subject may become inaccessible. This cannot be undone."
        itemName={subjects.find((s) => s._id === deleteId)?.name}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
