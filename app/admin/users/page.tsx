'use client';
import { useEffect, useState } from 'react';
import { UserX, UserCheck, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

import GenericLottieLoader from '@/components/GenericLottieLoader';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface User {
  _id: string;
  name: string;
  email: string;
  designation?: string;
  title?: string;
  institute: string;
  regNumber: string;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
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

  const handleToggleBan = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    const newBanned = !targetUser.isBanned;
    try {
      const res = await fetch(`/api/admin/users/${targetUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanned }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, isBanned: newBanned } : u))
        );
        toast.success(
          newBanned
            ? `${targetUser.name} has been banned`
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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.institute?.toLowerCase().includes(search.toLowerCase())
  );

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
          {loading ? 'Loading users...' : `${users.length} Registered Users`}
        </p>
      </div>

      <div className="mb-4 sm:mb-5">
        <input
          id="user-search"
          type="text"
          placeholder="Search by name, email, or institute..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm"
        />
      </div>

      {loading ? (
        <GenericLottieLoader text="Loading Users..." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200/80 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50/50">
                  <th className="px-4 py-3">User & Designation</th>
                  <th className="px-4 py-3 hidden md:table-cell">Institute</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Reg/Roll No.</th>
                  <th className="px-4 py-3 hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-100">
                          {u.designation || u.title || 'Student'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-[180px] truncate">
                      {u.institute || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {u.regNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          u.isBanned
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        id={`ban-user-${u._id}`}
                        onClick={() => setTargetUser(u)}
                        className={`p-2 rounded-xl transition-all border ${
                          u.isBanned
                            ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-red-50/80 text-red-600 border-red-200/80 hover:bg-red-100'
                        }`}
                        title={u.isBanned ? 'Unban User Account' : 'Ban User Account'}
                      >
                        {u.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No registered users found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!targetUser}
        title={targetUser?.isBanned ? `Unban ${targetUser?.name}?` : `Ban ${targetUser?.name}?`}
        description={
          targetUser?.isBanned
            ? 'This will restore the user’s access to Dip-Desk features.'
            : 'This will restrict the user from accessing account features and submitting requests.'
        }
        itemName={targetUser?.email}
        confirmText={targetUser?.isBanned ? 'Yes, Unban User' : 'Yes, Ban User'}
        onConfirm={handleToggleBan}
        onCancel={() => setTargetUser(null)}
        loading={actionLoading}
      />
    </div>
  );
}
