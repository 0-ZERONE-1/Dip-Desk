'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatImageUrl, isImageUrl } from '@/lib/utils';

interface Department { _id: string; name: string; slug: string; description: string; icon: string; color: string; isActive: boolean; }
const emptyForm = { name: '', description: '', icon: '', color: '#6366f1' };

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetch(`/api/departments?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json());
    setDepartments(data.departments || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/departments/${editId}` : '/api/departments';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(editId ? 'Updated!' : 'Department created!');
      setShowForm(false); setEditId(null); setForm(emptyForm);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department? All associated subjects and resources will be affected.')) return;
    setDepartments((prev) => prev.filter((d) => d._id !== id));
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Departments / Branches</h1>
        <button id="add-dept-btn" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary flex-shrink-0 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Department
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editId ? 'Edit Department' : 'New Department'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department Name *</label>
              <input id="dept-name" type="text" placeholder="e.g. Computer Science & Technology" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Department Icon Image URL
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-transparent border border-surface-200 flex items-center justify-center overflow-hidden flex-shrink-0 text-2xl aspect-square">
                  {isImageUrl(form.icon) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formatImageUrl(form.icon)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{form.icon || '📁'}</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Paste direct image link (e.g. https://imgur.com/... or https://domain.com/icon.png)..."
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="input flex-1"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
              <input id="dept-description" type="text" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button id="save-dept-btn" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="card p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-transparent border border-surface-200 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden aspect-square">
                {isImageUrl(d.icon) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formatImageUrl(d.icon)} alt={d.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>{d.icon || '📁'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{d.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">/browse/{d.slug}</p>
                {d.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{d.description}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button id={`edit-dept-${d._id}`} onClick={() => { setEditId(d._id); setForm({ name: d.name, description: d.description, icon: d.icon, color: d.color }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button id={`delete-dept-${d._id}`} onClick={() => handleDelete(d._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 card p-12 text-center text-gray-400">No departments yet. Add one to get started.</div>
          )}
        </div>
      )}
    </div>
  );
}
