'use client';
import { useEffect, useState } from 'react';
import { UserX, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface User { _id: string; name: string; email: string; title: string; institute: string; regNumber: string; isBanned: boolean; createdAt: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((d) => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  const toggleBan = async (user: User) => {
    const newBanned = !user.isBanned;
    const confirm_ = confirm(`${newBanned ? 'Ban' : 'Unban'} ${user.name}?`);
    if (!confirm_) return;
    const res = await fetch(`/api/admin/users/${user._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isBanned: newBanned }) });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isBanned: newBanned } : u));
      toast.success(newBanned ? `${user.name} banned` : `${user.name} unbanned`);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.institute?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Student Users</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{users.length} registered students</p>
      </div>

      <div className="mb-4 sm:mb-5">
        <input id="user-search" type="text" placeholder="Search by name, email or institute..." value={search} onChange={(e) => setSearch(e.target.value)} className="input text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Student</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Institute</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Roll No.</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[160px] truncate">{u.institute}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{u.regNumber}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={u.isBanned ? 'badge-danger' : 'badge-success'}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`ban-user-${u._id}`}
                        onClick={() => toggleBan(u)}
                        className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={u.isBanned ? 'Unban user' : 'Ban user'}
                      >
                        {u.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
