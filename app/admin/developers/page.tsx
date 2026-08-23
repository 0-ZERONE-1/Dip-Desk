'use client';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import {
  Plus,
  Edit2,
  Trash2,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Globe,
  Loader2,
  Code2,
  X,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addClientDeletedId, saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';
import { formatImageUrl } from '@/lib/utils';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';

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
  order?: number;
  isActive?: boolean;
}

// Sanitizer: Allows letters, numbers, spaces, and common basic symbols (., -&/()') - Strips emojis and special symbols
const sanitizeText = (val: string) => {
  return val
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-zA-Z0-9\s.,\-&/()']/g, '');
};

// Sanitizer for bio: Converts newlines to spaces, strips emojis
const sanitizeBio = (val: string) => {
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

// Email validator
const isValidEmailOrMailto = (str: string) => {
  if (!str || !str.trim()) return true;
  const trimmed = str.trim().replace(/^mailto:/i, '');
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(trimmed);
};

// URL normalizer (prepends https:// if missing)
const normalizeUrl = (urlStr: string) => {
  if (!urlStr || !urlStr.trim()) return '';
  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export default function AdminDevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    order: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const res = await fetch(`/api/developers?all=true&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : data.developers || [];
      const formatted = rawList.map((d: Developer) => ({
        ...d,
        isActive: d.isActive !== false,
      }));
      const synced = syncAndFilterItems<Developer>('developers', formatted);
      synced.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      setDevelopers(synced);
    } catch {
      toast.error('Failed to fetch developers');
    } finally {
      setLoading(false);
    }
  };

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
      order: developers.length + 1,
      isActive: true,
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
      order: dev.order || 1,
      isActive: dev.isActive !== false,
    });
    setShowModal(true);
  };

  const toggleActive = async (dev: Developer) => {
    const updatedActive = dev.isActive === false ? true : false;
    setDevelopers((prev) =>
      prev.map((d) => (d._id === dev._id ? { ...d, isActive: updatedActive } : d))
    );
    try {
      await fetch(`/api/developers/${dev._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedActive }),
      });
      toast.success(updatedActive ? 'Developer activated (visible to students)' : 'Developer deactivated (hidden from students)');
    } catch {
      toast.error('Failed to update active status');
      fetchDevelopers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and Role are required');
      return;
    }

    // Link validations
    if (form.imageUrl && !isValidUrl(form.imageUrl)) {
      toast.error('Please enter a valid Image URL (e.g. https://example.com/avatar.jpg)');
      return;
    }
    if (form.githubUrl && !isValidUrl(form.githubUrl)) {
      toast.error('Please enter a valid GitHub URL (e.g. https://github.com/username)');
      return;
    }
    if (form.linkedinUrl && !isValidUrl(form.linkedinUrl)) {
      toast.error('Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)');
      return;
    }
    if (form.instagramUrl && !isValidUrl(form.instagramUrl)) {
      toast.error('Please enter a valid Instagram URL (e.g. https://instagram.com/username)');
      return;
    }
    if (form.portfolioUrl && !isValidUrl(form.portfolioUrl)) {
      toast.error('Please enter a valid Portfolio URL (e.g. https://myportfolio.com)');
      return;
    }
    if (form.emailUrl && !isValidEmailOrMailto(form.emailUrl)) {
      toast.error('Please enter a valid Email address (e.g. developer@example.com)');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedPayload = {
        ...form,
        name: sanitizeText(form.name).trim(),
        role: sanitizeText(form.role).trim(),
        bio: sanitizeBio(form.bio).trim(),
        imageUrl: normalizeUrl(form.imageUrl),
        githubUrl: normalizeUrl(form.githubUrl),
        linkedinUrl: normalizeUrl(form.linkedinUrl),
        instagramUrl: normalizeUrl(form.instagramUrl),
        portfolioUrl: normalizeUrl(form.portfolioUrl),
        emailUrl: form.emailUrl.trim()
          ? form.emailUrl.trim().startsWith('mailto:')
            ? form.emailUrl.trim()
            : `mailto:${form.emailUrl.trim()}`
          : '',
      };

      const url = editingDev ? `/api/developers/${editingDev._id}` : '/api/developers';
      const method = editingDev ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      });

      if (!res.ok) throw new Error();

      const resData = await res.json().catch(() => null);
      if (resData && (resData._id || resData.developer?._id)) {
        saveClientCustomItem('developers', resData.developer || resData);
      } else {
        saveClientCustomItem('developers', { _id: editingDev?._id || `dev_${Date.now()}`, ...normalizedPayload });
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
    setDeleteLoading(true);
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
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filtered = developers.filter((d) => {
    if (filterStatus === 'active' && d.isActive === false) return false;
    if (filterStatus === 'inactive' && d.isActive !== false) return false;
    return true;
  });

  const hasActiveFilters = Boolean(filterStatus);
  const resetFilters = () => setFilterStatus('');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
              Manage Developers
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading developers...'
              : hasActiveFilters
              ? `Showing ${filtered.length} of ${developers.length} ${developers.length === 1 ? 'Developer' : 'Developers'}`
              : `${developers.length} ${developers.length === 1 ? 'Developer' : 'Developers'}`}
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          Add Developer
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
        <AnimatedSelect
          id="filter-dev-status"
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active (Visible)' },
            { value: 'inactive', label: 'Inactive (Hidden)' },
          ]}
          placeholder="All Status"
          className="min-w-[150px]"
        />
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-primary-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-all border border-surface-200"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <GenericLottieLoader text="Loading Developers..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Developers Found</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">Click below to add your first developer profile.</p>
          <button onClick={openAddModal} className="btn-primary mx-auto">
            Add Developer Profile
          </button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden shadow-card border border-surface-200/90 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-surface-50/80 border-b border-surface-200/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5">Developer</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Social Links</th>
                  <th className="py-3.5 px-5">Order</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100/90 text-xs sm:text-sm">
                {filtered.map((dev, idx) => (
                  <tr key={dev._id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden aspect-square border border-surface-200/80 shadow-xs bg-surface-100">
                          {dev.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={formatImageUrl(dev.imageUrl)}
                              alt={dev.name}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-xs">
                              {dev.name?.[0]?.toUpperCase() || 'D'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-primary-600 transition-colors">
                            {dev.name}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-md mt-0.5">
                            {dev.bio || 'No bio provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="badge-primary text-xs px-2.5 py-1 font-semibold">
                        {dev.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400">
                        {dev.githubUrl && (
                          <a href={dev.githubUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-gray-800 transition-colors" title="GitHub">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {dev.linkedinUrl && (
                          <a href={dev.linkedinUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-blue-600 transition-colors" title="LinkedIn">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {dev.instagramUrl && (
                          <a href={dev.instagramUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-pink-600 transition-colors" title="Instagram">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {dev.emailUrl && (
                          <a href={dev.emailUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-emerald-600 transition-colors" title="Email">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {dev.portfolioUrl && (
                          <a href={dev.portfolioUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-purple-600 transition-colors" title="Portfolio">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {!dev.githubUrl && !dev.linkedinUrl && !dev.instagramUrl && !dev.emailUrl && !dev.portfolioUrl && (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-primary-50 text-primary-700 border border-primary-100/90 shadow-2xs">
                        #{dev.order ?? idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(dev)}
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all border ${
                          dev.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {dev.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleActive(dev)}
                          className={`p-1.5 rounded-xl transition-all border ${
                            dev.isActive !== false
                              ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                          }`}
                          title={dev.isActive !== false ? 'Deactivate (Hide from Students)' : 'Activate (Show to Students)'}
                        >
                          {dev.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(dev)}
                          className="p-1.5 bg-primary-50/80 text-primary-600 border border-primary-200/80 hover:bg-primary-100 rounded-xl transition-all"
                          title="Edit Developer Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(dev._id)}
                          className="p-1.5 bg-red-50/80 text-red-600 border border-red-200/80 hover:bg-red-100 rounded-xl transition-all"
                          title="Delete Developer Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
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
                    {editingDev ? 'Edit Developer' : 'Add New Developer'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingDev ? 'Update team profile & social links' : 'Add a new member to the developer team'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Row 1: Full Name + Role + Display Order in one line */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name * <span className="text-[11px] font-normal text-gray-400">(25 CH LIM)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: sanitizeText(e.target.value) })}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role * <span className="text-[11px] font-normal text-gray-400">(50 CH LIM)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="e.g. Lead Full-Stack Developer & UI/UX"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: sanitizeText(e.target.value) })}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL <span className="text-[11px] font-normal text-gray-400">(250 CH LIM)</span>
                </label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formatImageUrl(form.imageUrl)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="url"
                    autoComplete="off"
                    maxLength={250}
                    placeholder="https://github.com/username/repo/blob/main/avatar.png"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value.trim() })}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Bio <span className="text-[11px] font-normal text-gray-400">(150 CH LIM)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={150}
                  placeholder="Brief description about background and contributions..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: sanitizeBio(e.target.value) })}
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
                  GitHub URL <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                </label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  LinkedIn URL <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                </label>
                <input
                  type="url"
                  maxLength={100}
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Instagram URL <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                </label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Link / Address <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="mailto:developer@example.com"
                  value={form.emailUrl}
                  onChange={(e) => setForm({ ...form, emailUrl: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Portfolio URL <span className="text-[11px] font-normal text-gray-400">(100 CH LIM)</span>
                </label>
                <input
                  type="url"
                  maxLength={100}
                  placeholder="https://myportfolio.dev"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="active-developer"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                />
                <label htmlFor="active-developer" className="text-xs font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  Active (Visible to Students on Developers Page)
                </label>
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
      </div>
    )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Remove this developer?"
        description="This will permanently remove the developer profile from the team page."
        itemName={developers.find((d) => d._id === deleteId)?.name}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
  </div>
);
}
