'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Users, MessageSquare, Heart, TrendingUp, Database } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  resources: number;
  users: number;
  requests: number;
  departments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ resources: 0, users: 0, requests: 0, departments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/resources').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/requests').then((r) => r.json()),
      fetch('/api/departments').then((r) => r.json()),
    ]).then(([res, users, requests, depts]) => {
      setStats({
        resources: res.resources?.length || 0,
        users: users.users?.length || 0,
        requests: requests.requests?.filter((r: any) => r.status === 'Pending').length || 0,
        departments: depts.departments?.length || 0,
      });
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Resources', value: stats.resources, icon: BookOpen, color: 'text-primary-600 bg-primary-50', href: '/admin/resources' },
    { label: 'Registered Students', value: stats.users, icon: Users, color: 'text-emerald-600 bg-emerald-50', href: '/admin/users' },
    { label: 'Pending Requests', value: stats.requests, icon: MessageSquare, color: 'text-amber-600 bg-amber-50', href: '/admin/requests' },
    { label: 'Departments', value: stats.departments, icon: Database, color: 'text-violet-600 bg-violet-50', href: '/admin/departments' },
  ];

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of Dip-Desk platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} id={`admin-stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`} className="card-hover p-5 flex items-center gap-4 block">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {loading ? <span className="skeleton w-8 h-6 inline-block rounded" /> : card.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/admin/resources', label: 'Upload New Resource', desc: 'Add notes, books, or question papers', color: 'text-primary-600' },
            { href: '/admin/departments', label: 'Manage Departments', desc: 'Add or remove branches', color: 'text-violet-600' },
            { href: '/admin/requests', label: 'Review Requests', desc: `${stats.requests} pending student requests`, color: 'text-amber-600' },
            { href: '/admin/users', label: 'Manage Students', desc: 'View, edit, or ban accounts', color: 'text-emerald-600' },
            { href: '/admin/health-check', label: 'Run Link Health Check', desc: 'Verify all resource URLs', color: 'text-red-600' },
            { href: '/admin/subjects', label: 'Manage Subjects', desc: 'Add subjects for each semester', color: 'text-blue-600' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="card-hover p-4 block group"
            >
              <p className={`text-sm font-bold ${action.color} group-hover:underline`}>{action.label} →</p>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
