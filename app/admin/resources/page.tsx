'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES } from '@/lib/utils';

interface Department { _id: string; name: string; slug: string; }
interface Subject { _id: string; name: string; slug: string; semesterNumber: number; departmentId: Department; }
interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  isActive: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  subjectId: { _id: string; name: string; semesterNumber: number; departmentId: Department };
}

const emptyForm = { title: '', description: '', url: '', category: 'Notes', subjectId: '', tags: '' };

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      setFilteredSubjects(subjects.filter((s) => s.departmentId?._id === selectedDept));
    } else {
      setFilteredSubjects(subjects);
    }
  }, [selectedDept, subjects]);

  const loadAll = async () => {
    setLoading(true);
    const t = Date.now();
    const [resData, deptData, subData] = await Promise.all([
      fetch(`/api/resources?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/subjects?t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
    ]);
    setResources(resData.resources || []);
    setDepartments(deptData.departments || []);
    setSubjects(subData.subjects || []);
    setFilteredSubjects(subData.subjects || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.url || !form.subjectId) {
      toast.error('Title, URL, and subject are required');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      const url = editId ? `/api/resources/${editId}` : '/api/resources';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
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
    setForm({
      title: r.title,
      description: r.description,
      url: r.url,
      category: r.category,
      subjectId: r.subjectId?._id || '',
      tags: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setResources((prev) => prev.filter((r) => r._id !== id));
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    loadAll();
  };

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subjectId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page Header - always visible, stacks on mobile */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Resources</h1>
        <button
          id="add-resource-btn"
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Resource
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="resource-search"
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 text-sm"
        />
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Resource' : 'New Resource'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input id="resource-title" type="text" placeholder="Resource title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL</label>
              <input id="resource-url" type="url" placeholder="https://drive.google.com/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select id="resource-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department (filter)</label>
              <select id="resource-dept-filter" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="select">
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <select id="resource-subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="select">
                <option value="">Select subject...</option>
                {filteredSubjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.departmentId?.name} · Sem {s.semesterNumber} · {s.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
              <textarea id="resource-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={2} className="input resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button id="save-resource-btn" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Create Resource'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Subject</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Votes</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.category}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{r.subjectId?.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">▲{r.upvotes} ▼{r.downvotes}</td>
                    <td className="px-4 py-3">
                      <span className={r.isActive ? 'badge-success' : 'badge-danger'}>
                        {r.isActive ? 'Active' : 'Broken'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button id={`edit-resource-${r._id}`} onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button id={`delete-resource-${r._id}`} onClick={() => handleDelete(r._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No resources found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
