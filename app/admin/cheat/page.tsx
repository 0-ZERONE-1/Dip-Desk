'use client';
import { useEffect, useState } from 'react';
import {
  Zap,
  Search,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Save,
  Loader2,
  Edit2,
  X,
  Sliders,
  TrendingUp,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedSelect from '@/components/AnimatedSelect';
import { CATEGORIES } from '@/lib/utils';
import { saveClientCustomItem, syncAndFilterItems } from '@/lib/clientStore';

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
  upvotes?: number;
  downvotes?: number;
  createdAt: string;
}

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

const getSemesterNumber = (subjectId: any, subjectsList: Subject[]) => {
  const subObj = getSubjectObj(subjectId, subjectsList);
  return subObj?.semesterNumber || null;
};

export default function AdminCheatPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Stats Cheat State
  const [statsData, setStatsData] = useState<{
    resources: number;
    subjects: number;
    students: number;
    visitors: number;
    actuals: { resources: number; subjects: number; students: number; visitors: number };
    overrides: { resources: number | null; subjects: number | null; students: number | null; visitors: number | null };
  } | null>(null);

  const [inputResources, setInputResources] = useState<string>('');
  const [inputSubjects, setInputSubjects] = useState<string>('');
  const [inputStudents, setInputStudents] = useState<string>('');
  const [inputVisitors, setInputVisitors] = useState<string>('');
  const [inputLogoUrl, setInputLogoUrl] = useState<string>('');
  const [savingStats, setSavingStats] = useState(false);
  const [resettingStats, setResettingStats] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [sortBy, setSortBy] = useState<'most_up' | 'least_up' | 'most_down' | 'newest'>('most_up');

  // Edit Modal State
  const [activeModalResource, setActiveModalResource] = useState<Resource | null>(null);
  const [modalUpvotes, setModalUpvotes] = useState<number>(0);
  const [modalDownvotes, setModalDownvotes] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/stats?t=${Date.now()}`, { cache: 'no-store' });
      const d = await res.json();
      setStatsData(d);
      setInputResources(d.overrides?.resources !== null && d.overrides?.resources !== undefined ? String(d.overrides.resources) : '');
      setInputSubjects(d.overrides?.subjects !== null && d.overrides?.subjects !== undefined ? String(d.overrides.subjects) : '');
      setInputStudents(d.overrides?.students !== null && d.overrides?.students !== undefined ? String(d.overrides.students) : '');
      setInputVisitors(d.overrides?.visitors !== null && d.overrides?.visitors !== undefined ? String(d.overrides.visitors) : '');
      if (d.customLogoUrl) setInputLogoUrl(d.customLogoUrl);
    } catch {}
  };

  const handleSaveStatsOverride = async () => {
    setSavingStats(true);
    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideResources: inputResources.trim() !== '' ? Math.max(0, parseInt(inputResources, 10) || 0) : null,
          overrideSubjects: inputSubjects.trim() !== '' ? Math.max(0, parseInt(inputSubjects, 10) || 0) : null,
          overrideStudents: inputStudents.trim() !== '' ? Math.max(0, parseInt(inputStudents, 10) || 0) : null,
          overrideVisitors: inputVisitors.trim() !== '' ? Math.max(0, parseInt(inputVisitors, 10) || 0) : null,
          customLogoUrl: inputLogoUrl.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setStatsData(updated);
      toast.success('Hero landing stats updated!');
    } catch {
      toast.error('Failed to update hero stats');
    } finally {
      setSavingStats(false);
    }
  };

  const handleResetStatsActual = async () => {
    setResettingStats(true);
    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setStatsData(updated);
      setInputResources('');
      setInputSubjects('');
      setInputStudents('');
      setInputVisitors('');
      toast.success('Reset to live actual database numbers!');
    } catch {
      toast.error('Failed to reset stats');
    } finally {
      setResettingStats(false);
    }
  };

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
      toast.error('Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  const updateVotes = async (resourceId: string, newUpvotes: number, newDownvotes: number) => {
    const validUpvotes = Math.max(0, Number(newUpvotes) || 0);
    const validDownvotes = Math.max(0, Number(newDownvotes) || 0);

    setSavingId(resourceId);
    try {
      const target = resources.find((r) => r._id === resourceId);
      if (!target) return;

      const updatedPayload = {
        ...target,
        upvotes: validUpvotes,
        downvotes: validDownvotes,
      };

      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upvotes: validUpvotes,
          downvotes: validDownvotes,
        }),
      });

      if (!res.ok) throw new Error();

      // Update local state and store
      setResources((prev) =>
        prev.map((r) => (r._id === resourceId ? { ...r, upvotes: validUpvotes, downvotes: validDownvotes } : r))
      );
      saveClientCustomItem('resources', updatedPayload);

      toast.success('Engagement stats updated!');
      if (activeModalResource?._id === resourceId) {
        setActiveModalResource(null);
      }
    } catch {
      toast.error('Failed to update votes');
    } finally {
      setSavingId(null);
    }
  };

  const [resettingAllVotes, setResettingAllVotes] = useState(false);

  const handleResetCurrentModalVotes = () => {
    if (!activeModalResource) return;
    const ratings = (activeModalResource as any).ratings || [];
    const organicUp = ratings.filter((r: any) => r.vote === 'up').length;
    const organicDown = ratings.filter((r: any) => r.vote === 'down').length;
    setModalUpvotes(organicUp);
    setModalDownvotes(organicDown);
    toast.success(`Reset to original student votes (${organicUp} Likes, ${organicDown} Dislikes)`);
  };

  const handleResetAllResourceVotes = async () => {
    setResettingAllVotes(true);
    try {
      await Promise.all(
        resources.map(async (r) => {
          const ratings = (r as any).ratings || [];
          const organicUp = ratings.filter((rate: any) => rate.vote === 'up').length;
          const organicDown = ratings.filter((rate: any) => rate.vote === 'down').length;
          return fetch(`/api/resources/${r._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ upvotes: organicUp, downvotes: organicDown }),
          });
        })
      );
      toast.success('All resource votes reset to original organic student counts!');
      loadAll();
    } catch {
      toast.error('Failed to reset resource votes');
    } finally {
      setResettingAllVotes(false);
    }
  };

  const openEditModal = (resource: Resource) => {
    setActiveModalResource(resource);
    setModalUpvotes(resource.upvotes || 0);
    setModalDownvotes(resource.downvotes || 0);
  };

  // Quick adjust helper
  const handleQuickAdd = (resource: Resource, upChange: number, downChange: number) => {
    const curUp = resource.upvotes || 0;
    const curDown = resource.downvotes || 0;
    updateVotes(resource._id, curUp + upChange, curDown + downChange);
  };

  // Aggregate Stats
  const totalLikes = resources.reduce((acc, r) => acc + (r.upvotes || 0), 0);
  const totalDislikes = resources.reduce((acc, r) => acc + (r.downvotes || 0), 0);

  // Filtered and Sorted list
  const filtered = resources
    .filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subObj = getSubjectObj(r.subjectId, subjects);
        const subName = subObj?.name?.toLowerCase() || '';
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchSub = subName.includes(q);
        if (!matchTitle && !matchSub) return false;
      }

      if (filterCategory && r.category !== filterCategory) return false;

      if (filterDept) {
        const subObj = getSubjectObj(r.subjectId, subjects);
        const dId = typeof subObj?.departmentId === 'object' ? subObj?.departmentId?._id : subObj?.departmentId;
        if (dId !== filterDept && dId !== 'all') return false;
      }

      if (filterSem) {
        const semNum = getSemesterNumber(r.subjectId, subjects);
        if (semNum !== Number(filterSem)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const upA = a.upvotes || 0;
      const upB = b.upvotes || 0;
      const downA = a.downvotes || 0;
      const downB = b.downvotes || 0;

      if (sortBy === 'most_up') return upB - upA;
      if (sortBy === 'least_up') return upA - upB;
      if (sortBy === 'most_down') return downB - downA;
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

  const hasActiveFilters = Boolean(searchQuery || filterCategory || filterDept || filterSem || sortBy !== 'most_up');

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterDept('');
    setFilterSem('');
    setSortBy('most_up');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">Cheat Controls</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            You Cheater, Shame On you
          </p>
        </div>
      </div>

      {/* Hero Stats Manipulator Card */}
      <div className="card p-6 border border-primary-200/80 bg-gradient-to-br from-primary-50/50 via-white to-accent-50/30 mb-8 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-surface-200/80 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-extrabold text-gray-900">
                Hero Landing Stats Control
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manipulate home page numbers or reset anytime to live actual database counts.
            </p>
          </div>
          <button
            onClick={handleResetStatsActual}
            disabled={resettingStats}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-surface-100 border border-surface-200 rounded-xl transition-all shadow-xs"
            title="Reset to 100% live database counts"
          >
            {resettingStats ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-primary-600" />
            )}
            Reset to Actual Live Counts
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Resources */}
          <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700">Resources</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Actual: {statsData?.actuals.resources ?? 0}
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder={`Live (${statsData?.actuals.resources ?? 0})`}
              value={inputResources}
              onChange={(e) => setInputResources(e.target.value)}
              className="input text-xs py-2 font-semibold text-primary-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {inputResources.trim() !== '' ? `Custom override: ${inputResources}+` : `Using live actual: ${statsData?.actuals.resources ?? 0}`}
            </p>
          </div>

          {/* Subjects */}
          <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700">Subjects</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Actual: {statsData?.actuals.subjects ?? 0}
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder={`Live (${statsData?.actuals.subjects ?? 0})`}
              value={inputSubjects}
              onChange={(e) => setInputSubjects(e.target.value)}
              className="input text-xs py-2 font-semibold text-primary-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {inputSubjects.trim() !== '' ? `Custom override: ${inputSubjects}+` : `Using live actual: ${statsData?.actuals.subjects ?? 0}`}
            </p>
          </div>

          {/* Registered Students */}
          <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700">Registered Students</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Actual: {statsData?.actuals.students ?? 0}
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder={`Live (${statsData?.actuals.students ?? 0})`}
              value={inputStudents}
              onChange={(e) => setInputStudents(e.target.value)}
              className="input text-xs py-2 font-semibold text-primary-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {inputStudents.trim() !== '' ? `Custom override: ${inputStudents}+` : `Using live actual: ${statsData?.actuals.students ?? 0}`}
            </p>
          </div>

          {/* Visitors */}
          <div className="bg-white p-3.5 rounded-xl border border-surface-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700">Visitors</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                Actual: {statsData?.actuals.visitors ?? 0}
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder={`Live (${statsData?.actuals.visitors ?? 0})`}
              value={inputVisitors}
              onChange={(e) => setInputVisitors(e.target.value)}
              className="input text-xs py-2 font-semibold text-primary-700"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {inputVisitors.trim() !== '' ? `Custom override: ${inputVisitors}+` : `Using live actual: ${statsData?.actuals.visitors ?? 0}`}
            </p>
          </div>

          {/* Website Custom Logo URL Input Box */}
          <div className="bg-white p-3.5 rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 shadow-2xs col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                Website Custom Logo Link / SVG URL (Applies Everywhere)
              </span>
              {inputLogoUrl && (
                <button
                  onClick={() => setInputLogoUrl('')}
                  className="text-[10px] text-red-600 hover:underline font-bold"
                >
                  Reset to Simple Book Icon
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Paste logo image link (e.g., /logo.svg or https://example.com/logo.png)"
              value={inputLogoUrl}
              onChange={(e) => setInputLogoUrl(e.target.value)}
              className="input text-xs py-2 font-semibold text-purple-800 border-purple-200 focus:ring-purple-400"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {inputLogoUrl.trim() !== '' ? `Active custom logo link: ${inputLogoUrl}` : 'No custom logo link added — Displaying simple book icon across website'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSaveStatsOverride}
            disabled={savingStats}
            className="btn-primary text-xs py-2 px-4"
          >
            {savingStats ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Custom Hero Numbers
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 sm:p-5 flex items-center gap-3.5 border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Resources</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{resources.length}</p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 flex items-center gap-3.5 border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Platform Likes</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{totalLikes}</p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 flex items-center gap-3.5 border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <ThumbsDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Platform Dislikes</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{totalDislikes}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3 max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search resource title or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 text-xs sm:text-sm py-2"
        />
      </div>

      {/* 4 Filters in One Horizontal Line */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 flex-wrap">
        {/* Category Filter */}
        <AnimatedSelect
          value={filterCategory}
          onChange={(val) => setFilterCategory(val)}
          options={[
            { value: '', label: 'All Categories' },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          placeholder="All Categories"
          className="min-w-[140px]"
        />

        {/* Department Filter */}
        <AnimatedSelect
          value={filterDept}
          onChange={(val) => setFilterDept(val)}
          options={[
            { value: '', label: 'All Departments' },
            ...departments.map((d) => ({ value: d._id, label: d.name })),
          ]}
          placeholder="All Departments"
          className="min-w-[150px]"
        />

        {/* Semester Filter */}
        <AnimatedSelect
          value={filterSem}
          onChange={(val) => setFilterSem(val)}
          options={[
            { value: '', label: 'All Semesters' },
            ...[1, 2, 3, 4, 5, 6].map((s) => ({ value: String(s), label: `Semester ${s}` })),
          ]}
          placeholder="All Semesters"
          className="min-w-[130px]"
        />

        {/* Sort Order */}
        <AnimatedSelect
          value={sortBy}
          onChange={(val) => setSortBy(val as any)}
          options={[
            { value: 'most_up', label: 'Most Likes' },
            { value: 'least_up', label: 'Least Likes' },
            { value: 'most_down', label: 'Most Dislikes' },
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
          ]}
          placeholder="Sort Order"
          className="min-w-[140px]"
        />

        <button
          onClick={handleResetAllResourceVotes}
          disabled={resettingAllVotes}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-xs"
          title="Reset all resource votes to original student counts"
        >
          {resettingAllVotes ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          <span>Reset All Votes to Original</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-primary-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-all border border-surface-200"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left">
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Resource</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 hidden lg:table-cell">Department & Sem</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-center">Likes (▲ Upvotes)</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-center">Dislikes (▼ Downvotes)</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const subObj = getSubjectObj(r.subjectId, subjects);
                  const subName = subObj?.name || '—';
                  const deptName = getDeptName(r.subjectId, subjects, departments);
                  const semNum = getSemesterNumber(r.subjectId, subjects);
                  const isSaving = savingId === r._id;

                  return (
                    <tr
                      key={r._id}
                      className="border-b border-surface-100 hover:bg-surface-50/80 transition-colors"
                    >
                      {/* Resource Title */}
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <p className="font-bold text-gray-900 truncate" title={r.title}>
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{subName}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-medium hidden md:table-cell whitespace-nowrap">
                        {r.category}
                      </td>

                      {/* Department & Semester */}
                      <td className="px-4 py-3.5 text-xs text-gray-600 hidden lg:table-cell">
                        <div className="truncate max-w-[180px]">{deptName}</div>
                        <div className="text-gray-400 font-medium">{semNum ? `Sem ${semNum}` : '—'}</div>
                      </td>

                      {/* Likes Counter */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50/80 px-3 py-1 rounded-xl border border-emerald-100 font-extrabold text-emerald-700 text-xs">
                          ▲ {r.upvotes || 0}
                        </span>
                      </td>

                      {/* Dislikes Counter */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-rose-50/80 px-3 py-1 rounded-xl border border-rose-100 font-extrabold text-rose-700 text-xs">
                          ▼ {r.downvotes || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => openEditModal(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-surface-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-surface-200 transition-all"
                          title="Open Custom Counter Modifier"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Modify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No resources found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Likes/Dislikes Edit Modal */}
      {activeModalResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          {/* Outer gradient cap wrapper matching other admin modals */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Inner modal body */}
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold gradient-text">Modify Engagement</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fine-tune student engagement scores and vote statistics
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalResource(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateVotes(activeModalResource._id, modalUpvotes, modalDownvotes);
                }}
                className="p-6 space-y-5 overflow-y-auto"
              >
                {/* Resource Info Card */}
                <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Resource</p>
                    <p className="text-sm font-bold text-gray-900 truncate mt-0.5" title={activeModalResource.title}>
                      {activeModalResource.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-200/70 text-gray-700">
                      {activeModalResource.category}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100">
                      {getDeptName(activeModalResource.subjectId, subjects, departments)}
                    </span>
                  </div>
                </div>

                {/* 2-Column Grid for Likes & Dislikes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Likes / Upvotes Input */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        Likes (Upvotes) Count
                      </label>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Current: {activeModalResource.upvotes || 0}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={999999}
                        value={modalUpvotes}
                        onChange={(e) => setModalUpvotes(Math.max(0, parseInt(e.target.value) || 0))}
                        className="input text-lg font-black text-emerald-700 py-2.5"
                      />
                    </div>
                    {/* Preset quick pills */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-gray-400">Quick set:</span>
                      {[0, 25, 50, 100, 250, 500, 1000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setModalUpvotes(val)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-2xs"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dislikes / Downvotes Input */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <ThumbsDown className="w-4 h-4 text-rose-600" />
                        Dislikes (Downvotes) Count
                      </label>
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-md">
                        Current: {activeModalResource.downvotes || 0}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={999999}
                        value={modalDownvotes}
                        onChange={(e) => setModalDownvotes(Math.max(0, parseInt(e.target.value) || 0))}
                        className="input text-lg font-black text-rose-700 py-2.5"
                      />
                    </div>
                    {/* Preset quick pills */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-gray-400">Quick set:</span>
                      {[0, 5, 10, 25, 50].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setModalDownvotes(val)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Preview Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-50/80 via-accent-50/50 to-primary-50/80 border border-primary-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Calculated Net Engagement Rating:</span>
                  <span className="text-sm font-black text-primary-700">
                    {modalUpvotes - modalDownvotes > 0 ? `+${modalUpvotes - modalDownvotes}` : modalUpvotes - modalDownvotes}{' '}
                    Net Score
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-100 mt-6">
                  <button
                    type="button"
                    onClick={handleResetCurrentModalVotes}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-surface-100 hover:bg-surface-200 border border-surface-200 rounded-xl transition-all shadow-2xs"
                    title="Reset votes to original organic student ratings count"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset to Original</span>
                  </button>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveModalResource(null)}
                      className="btn-ghost text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingId === activeModalResource._id}
                      className="btn-primary flex items-center gap-2"
                    >
                      {savingId === activeModalResource._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
