'use client';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  MessageSquare,
  Building2,
  Code2,
  Bell,
  BookMarked,
  Heart,
  ArrowRight,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { syncAndFilterItems } from '@/lib/clientStore';

interface Stats {
  resources: number;
  users: number;
  departments: number;
  developers: number;
  requests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    resources: 0,
    users: 0,
    departments: 0,
    developers: 0,
    requests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = Date.now();
    Promise.all([
      fetch(`/api/resources?t=${t}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/admin/users?t=${t}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/departments?t=${t}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/developers?t=${t}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/admin/requests?t=${t}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
    ]).then(([resData, usersData, deptsData, devsData, reqsData]) => {
      const resList = syncAndFilterItems('resources', Array.isArray(resData) ? resData : resData.resources || []);
      const usersList = usersData.users || [];
      const deptsList = syncAndFilterItems('departments', deptsData.departments || []);
      const devsList = syncAndFilterItems('developers', devsData.developers || devsData || []);
      const reqsList = syncAndFilterItems('requests', reqsData.requests || []);
      const pendingReqs = reqsList.filter((r: any) => r.status === 'Pending').length;

      setStats({
        resources: resList.length,
        users: usersList.length,
        departments: deptsList.length,
        developers: devsList.length,
        requests: pendingReqs,
      });
      setLoading(false);
    });
  }, []);

  const statCards = [
    {
      label: 'Total Resources',
      value: stats.resources,
      icon: BookOpen,
      color: 'text-primary-600 bg-primary-50 border-primary-100',
      href: '/admin/resources',
    },
    {
      label: 'Registered Users',
      value: stats.users,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      href: '/admin/users',
    },
    {
      label: 'Total Departments',
      value: stats.departments,
      icon: Building2,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      href: '/admin/departments',
    },
    {
      label: 'Total Developers',
      value: stats.developers,
      icon: Code2,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      href: '/admin/developers',
    },
    {
      label: 'Pending Requests',
      value: stats.requests,
      icon: MessageSquare,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      href: '/admin/requests',
    },
  ];

  const quickActions = [
    {
      href: '/admin/resources',
      label: 'Upload New Resource',
      desc: 'Add study notes, books, syllabus, and model questions',
      icon: BookOpen,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      href: '/admin/notices',
      label: 'Publish Notice',
      desc: 'Broadcast exam schedules and academic updates',
      icon: Bell,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      href: '/admin/subjects',
      label: 'Manage Subjects',
      desc: 'Organize curriculum subjects across departments',
      icon: BookMarked,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      href: '/admin/departments',
      label: 'Manage Departments',
      desc: 'Configure academic branches, icons, and descriptions',
      icon: Building2,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      href: '/admin/developers',
      label: 'Manage Developers',
      desc: 'Update team profiles, bios, and social portfolio links',
      icon: Code2,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      href: '/admin/users',
      label: 'Manage Users',
      desc: 'View registered students and manage permissions',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      href: '/admin/requests',
      label: 'Review Requests',
      desc: `${stats.requests} pending student study material requests`,
      icon: MessageSquare,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      href: '/admin/cheat',
      label: 'Cheat Controls',
      desc: 'Adjust like & dislike counters and stats for resources',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      href: '/admin/health-check',
      label: 'Run Link Health Check',
      desc: 'Verify and diagnose all external resource links',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of Dip-Desk platform activity and metrics</p>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              id={`admin-stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="card-hover p-4 sm:p-5 flex items-center gap-3.5 block border border-surface-200"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-semibold truncate">{card.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5 leading-tight">
                  {loading ? <span className="skeleton w-8 h-6 inline-block rounded" /> : card.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Quick Actions & Shortcuts</h2>
            <p className="text-xs text-gray-500 mt-0.5">Direct shortcuts to manage all platform modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="card-hover p-4 block group border border-surface-200/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
