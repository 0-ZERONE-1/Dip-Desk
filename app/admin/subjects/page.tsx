'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEMESTERS } from '@/lib/utils';

interface Department { _id: string; name: string; }
interface Subject { _id: string; name: string; slug: string; semesterNumber: number; description: string; departmentId: Department; }
const emptyForm = { name: '', semesterNumber: 1, departmentId: '', description: '' };

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

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const t = Date.now();
    const [subData, deptData] = await Promise.all([
      fetch(`/api/subjects?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setSubjects(subData.subjects || []);
    setDepartments(deptData.departments || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.departmentId) { toast.error('Name and department are required'); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/subjects/${editId}` : '/api/subjects';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(editId ? 'Updated!' : 'Subject created!');
      setShowForm(false); setEditId(null); setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    load();
  };

  const filtered = subjects.filter((s) => {
    if (filterDept && s.departmentId?._id !== filterDept) return false;
    if (filterSem && s.semesterNumber !== parseInt(filterSem)) return false;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Subjects</h1>
        <button
          id="add-subject-btn"
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Subject
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
        <select id="filter-dept" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="select text-xs sm:text-sm flex-1 min-w-[130px] max-w-[200px]">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select id="filter-sem" value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className="select text-xs sm:text-sm flex-1 min-w-[110px] max-w-[160px]">
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Subject' : 'New Subject'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Name</label>
              <input id="subject-name" type="text" placeholder="e.g. Database Management Systems" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
              <select id="subject-dept" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="select">
                <option value="">Select Department...</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
              <select id="subject-semester" value={form.semesterNumber} onChange={(e) => setForm({ ...form, semesterNumber: parseInt(e.target.value) })} className="select">
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
              <input id="subject-description" type="text" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button id="save-subject-btn" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Subject</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Department</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Semester</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.departmentId?.name}</td>
                  <td className="px-4 py-3 text-gray-500">Sem {s.semesterNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button id={`edit-subject-${s._id}`} onClick={() => { setEditId(s._id); setForm({ name: s.name, semesterNumber: s.semesterNumber, departmentId: s.departmentId?._id || '', description: s.description }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button id={`delete-subject-${s._id}`} onClick={() => handleDelete(s._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No subjects found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
