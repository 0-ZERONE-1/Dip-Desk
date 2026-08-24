'use client';
import { useEffect, useState } from 'react';
import { UserX, UserCheck, Loader2, Users, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';

interface User {
  _id: string;
  name: string;
  email: string;
  designation?: string;
  title?: string;
  institute: string;
  regNumber: string;
  isBanned: boolean;
  bannedUntil?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'1h' | '24h' | '7d' | '30d' | 'permanent'>('24h');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const isUserBannedActive = (user: User) => {
    if (!user.isBanned) return false;
    if (!user.bannedUntil) return true; // permanent ban
    return new Date(user.bannedUntil) > new Date();
  };

  const getBanStatusText = (user: User) => {
    if (!user.isBanned) return 'Active';
    if (!user.bannedUntil) return 'Permanently Banned';
    const until = new Date(user.bannedUntil);
    const now = new Date();
    if (until <= now) return 'Active (Ban Expired)';

    const diffMs = until.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `Banned (${diffHours}h left)`;
    }
    const diffDays = Math.ceil(diffHours / 24);
    return `Banned (${diffDays}d left)`;
  };

  const handleConfirmBanAction = async () => {
    if (!targetUser) return;
    setActionLoading(true);

    const currentlyBanned = isUserBannedActive(targetUser);
    const newBanned = !currentlyBanned;
    let bannedUntilPayload: string | null = null;

    if (newBanned) {
      const now = Date.now();
      if (selectedDuration === '1h') bannedUntilPayload = new Date(now + 1 * 3600000).toISOString();
      else if (selectedDuration === '24h') bannedUntilPayload = new Date(now + 24 * 3600000).toISOString();
      else if (selectedDuration === '7d') bannedUntilPayload = new Date(now + 7 * 24 * 3600000).toISOString();
      else if (selectedDuration === '30d') bannedUntilPayload = new Date(now + 30 * 24 * 3600000).toISOString();
      else bannedUntilPayload = null; // permanent
    }

    try {
      const res = await fetch(`/api/admin/users/${targetUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanned, bannedUntil: bannedUntilPayload }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isBanned: newBanned, bannedUntil: bannedUntilPayload } : u
          )
        );
        toast.success(
          newBanned
            ? `${targetUser.name} has been banned (${selectedDuration === 'permanent' ? 'Permanent' : selectedDuration})`
            : `${targetUser.name} has been unbanned`
        );
      } else {
        toast.error('Failed to update ban status');
      }
    } catch {
      toast.error('Failed to update ban status');
    } finally {
      setActionLoading(false);
      setTargetUser(null);
    }
  };

  const filtered = users.filter((u) => {
    const isBanned = isUserBannedActive(u);
    if (filterStatus === 'active' && isBanned) return false;
    if (filterStatus === 'banned' && !isBanned) return false;

    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.institute?.toLowerCase().includes(s)
    );
  });

  const hasActiveFilters = Boolean(search || filterStatus);
  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
            Manage Users
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {loading
            ? 'Loading users...'
            : hasActiveFilters
            ? `Showing ${filtered.length} of ${users.length} Registered Users`
            : `${users.length} Registered Users`}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
        <input
          id="user-search"
          type="text"
          placeholder="Search by name, email, or institute..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm flex-1 min-w-[200px]"
        />
        <AnimatedSelect
          id="filter-user-status"
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active Users' },
            { value: 'banned', label: 'Banned Users' },
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

      {loading ? (
        <GenericLottieLoader text="Loading Users..." />
      ) : (
        <div className="card p-0 overflow-hidden shadow-card border border-surface-200/90 rounded-2xl">
          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-surface-100">
            {filtered.map((u) => {
              const bannedActive = isUserBannedActive(u);
              return (
                <div key={u._id} className="p-4 space-y-3 hover:bg-primary-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug break-words">{u.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{u.email}</p>
                      {u.institute && <p className="text-xs text-gray-500 mt-1 font-medium truncate">🏢 {u.institute}</p>}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border flex-shrink-0 ${
                        bannedActive
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {getBanStatusText(u)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-100 text-xs text-gray-500">
                    <span className="badge-primary text-[10px] px-2 py-0.5 font-semibold">
                      {u.designation || u.title || 'Student'}
                    </span>

                    <button
                      id={`ban-user-mob-${u._id}`}
                      onClick={() => setTargetUser(u)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                        bannedActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {bannedActive ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Unban User
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          Ban User
                        </>
                      )}
                    </button>
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
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Designation</th>
                  <th className="py-3.5 px-5 hidden md:table-cell">Institute</th>
                  <th className="py-3.5 px-5 hidden lg:table-cell">Reg/Roll No.</th>
                  <th className="py-3.5 px-5 hidden md:table-cell">Joined</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100/90 text-xs sm:text-sm">
                {filtered.map((u) => {
                  const bannedActive = isUserBannedActive(u);
                  return (
                    <tr key={u._id} className="hover:bg-primary-50/30 transition-colors group">
                      <td className="py-3.5 px-5">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors text-sm sm:text-base">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="badge-primary text-xs px-2.5 py-1 font-semibold">
                          {u.designation || u.title || 'Student'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-gray-600 hidden md:table-cell max-w-[180px] truncate">
                        {u.institute || 'N/A'}
                      </td>

                      <td className="py-3.5 px-5 text-gray-600 hidden lg:table-cell font-mono text-xs">
                        {u.regNumber || 'N/A'}
                      </td>

                      <td className="py-3.5 px-5 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            bannedActive
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {getBanStatusText(u)}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          id={`ban-user-${u._id}`}
                          onClick={() => setTargetUser(u)}
                          className={`p-1.5 rounded-xl transition-all border ${
                            bannedActive
                              ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                          }`}
                          title={bannedActive ? 'Unban User Account' : 'Ban User Account'}
                        >
                          {bannedActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No registered users found matching search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timed Ban Settings Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-md w-full flex flex-col overflow-hidden ${
              isUserBannedActive(targetUser)
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600'
            }`}
          >
            <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    {isUserBannedActive(targetUser) ? 'Unban User Account' : 'Ban User Account'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {targetUser.name} ({targetUser.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetUser(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {isUserBannedActive(targetUser) ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 text-xs text-red-800 space-y-1">
                      <p className="font-bold">Current Ban Details:</p>
                      <p>
                        {targetUser.bannedUntil
                          ? `Banned until ${new Date(targetUser.bannedUntil).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'Permanently Banned'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      Unbanning will immediately restore this user’s full access to Dip-Desk features.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700">
                      Select Ban Duration:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: '1h', label: '1 Hour', desc: 'Temporary warning' },
                        { id: '24h', label: '24 Hours', desc: '1 Day timeout' },
                        { id: '7d', label: '7 Days', desc: '1 Week restriction' },
                        { id: '30d', label: '30 Days', desc: '1 Month ban' },
                        { id: 'permanent', label: 'Permanent', desc: 'No expiration' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedDuration(opt.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            selectedDuration === opt.id
                              ? 'border-red-500 bg-red-50/80 text-red-700 shadow-xs ring-2 ring-red-500/20'
                              : 'border-surface-200 bg-surface-50/50 text-gray-700 hover:bg-surface-100'
                          } ${opt.id === 'permanent' ? 'col-span-2' : ''}`}
                        >
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[10px] text-gray-400 font-normal mt-0.5">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100">
                  <button
                    type="button"
                    onClick={() => setTargetUser(null)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleConfirmBanAction}
                    className={isUserBannedActive(targetUser) ? 'btn-emerald text-xs' : 'btn-danger text-xs'}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isUserBannedActive(targetUser) ? (
                      'Confirm Unban'
                    ) : (
                      'Apply Ban'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

