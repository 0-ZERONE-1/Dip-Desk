'use client';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { Plus, Edit2, Trash2, Github, Linkedin, Instagram, Mail, Globe, Loader2, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import { formatImageUrl } from '@/lib/utils';

interface Developer {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  emailUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  order?: number;
  isActive?: boolean;
}

export default function AdminDevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    role: '',
    bio: '',
    imageUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    emailUrl: '',
    portfolioUrl: '',
    order: 0,
  });

  const fetchDevelopers = async () => {
    try {
      const r = await fetch(`/api/developers?t=${Date.now()}`, { cache: 'no-store' });
      const d = await r.json();
      setDevelopers(syncAndFilterItems<Developer>('developers', d.developers || []));
    } catch {
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const openAddModal = () => {
    setEditingDev(null);
    setForm({
      name: '',
      role: '',
      bio: '',
      imageUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      emailUrl: '',
      portfolioUrl: '',
      order: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (dev: Developer) => {
    setEditingDev(dev);
    setForm({
      name: dev.name || '',
      role: dev.role || '',
      bio: dev.bio || '',
      imageUrl: dev.imageUrl || '',
      githubUrl: dev.githubUrl || '',
      linkedinUrl: dev.linkedinUrl || '',
      instagramUrl: dev.instagramUrl || '',
      emailUrl: dev.emailUrl || '',
      portfolioUrl: dev.portfolioUrl || '',
      order: dev.order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) {
      toast.error('Name and Role are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingDev ? `/api/developers/${editingDev._id}` : '/api/developers';
      const method = editingDev ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      const resData = await res.json().catch(() => null);
      if (resData && (resData._id || resData.developer?._id)) {
        saveClientCustomItem('developers', resData.developer || resData);
      } else {
        saveClientCustomItem('developers', { _id: editingDev?._id || `dev_${Date.now()}`, ...form });
      }

      toast.success(editingDev ? 'Developer updated' : 'Developer created');
      setShowModal(false);
      fetchDevelopers();
    } catch {
      toast.error('Failed to save developer profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    addClientDeletedId(id);
    setDevelopers((prev) => prev.filter((d) => d._id !== id));
    try {
      const res = await fetch(`/api/developers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Developer removed');
      fetchDevelopers();
    } catch {
      toast.error('Failed to delete developer');
      fetchDevelopers();
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <AdminNav />

      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Code2 className="w-7 h-7 text-primary-600" />
              Manage Developers
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add, edit, or remove developer profile cards displayed on the public /developers page.
            </p>
          </div>

          <button onClick={openAddModal} className="btn-primary flex-shrink-0">
            <Plus className="w-4 h-4" />
            Add Developer
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : developers.length === 0 ? (
          <div className="card p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No Developers Added</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">Click below to add your first developer profile.</p>
            <button onClick={openAddModal} className="btn-primary mx-auto">
              Add Developer Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((dev) => (
              <div key={dev._id} className="card p-6 flex flex-col justify-between relative group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-200 flex-shrink-0 bg-surface-100">
                    {dev.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formatImageUrl(dev.imageUrl)} alt={dev.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                        {dev.name?.[0]?.toUpperCase() || 'D'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{dev.name}</h3>
                    <span className="badge-primary text-xs mt-1 inline-block">{dev.role}</span>
                  </div>
                </div>

                {dev.bio && (
                  <p className="text-xs text-gray-500 line-clamp-5 break-words [overflow-wrap:anywhere] mb-4 leading-relaxed max-w-full">{dev.bio}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-surface-100 mt-auto">
                  <div className="flex items-center gap-2 text-gray-400">
                    {dev.githubUrl && <Github className="w-4 h-4" />}
                    {dev.linkedinUrl && <Linkedin className="w-4 h-4" />}
                    {dev.instagramUrl && <Instagram className="w-4 h-4" />}
                    {dev.emailUrl && <Mail className="w-4 h-4" />}
                    {dev.portfolioUrl && <Globe className="w-4 h-4" />}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(dev)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-surface-100 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dev._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-surface-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingDev ? 'Edit Developer' : 'Add New Developer'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Full Name *</label>
                    <span className="text-[11px] text-gray-400">max 25 chars</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Role / Title *</label>
                    <span className="text-[11px] text-gray-400">max 25 chars</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="e.g. Lead Full-Stack Developer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL (No Limit)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Short Bio</label>
                    <span className={`text-[11px] font-semibold ${150 - (form.bio?.length || 0) <= 15 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {150 - (form.bio?.length || 0)} characters left
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={150}
                    placeholder="Brief description about background and contributions..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input py-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GitHub URL (max 100)</label>
                    <input
                      type="url"
                      maxLength={100}
                      placeholder="https://github.com/username"
                      value={form.githubUrl}
                      onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL (max 100)</label>
                    <input
                      type="url"
                      maxLength={100}
                      placeholder="https://linkedin.com/in/username"
                      value={form.linkedinUrl}
                      onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram URL (max 100)</label>
                    <input
                      type="url"
                      maxLength={100}
                      placeholder="https://instagram.com/username"
                      value={form.instagramUrl}
                      onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Link / Address (max 100)</label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="mailto:developer@example.com"
                      value={form.emailUrl}
                      onChange={(e) => setForm({ ...form, emailUrl: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Portfolio URL (max 100)</label>
                  <input
                    type="url"
                    maxLength={100}
                    placeholder="https://myportfolio.dev"
                    value={form.portfolioUrl}
                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? 'Saving...' : editingDev ? 'Save Changes' : 'Add Developer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
