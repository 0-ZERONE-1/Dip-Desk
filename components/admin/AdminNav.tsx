'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import AnimatedSelect from '@/components/AnimatedSelect';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Heart,
  Building2,
  BookMarked,
  LogOut,
  Code2,
  Bell,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DipDeskLogo from '@/components/layout/DipDeskLogo';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/notices', label: 'Notices', icon: Bell },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/subjects', label: 'Subjects', icon: BookMarked },
  { href: '/admin/resources', label: 'Resources', icon: BookOpen },
  { href: '/admin/developers', label: 'Developers', icon: Code2 },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/cheat', label: 'Cheat', icon: Zap },
  { href: '/admin/health-check', label: 'Link Health', icon: Heart },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetchPendingCount();
  }, [pathname]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`/api/admin/requests?t=${Date.now()}`);
      const data = await res.json();
      if (data.requests) {
        const pending = data.requests.filter((r: any) => r.status?.toLowerCase() === 'pending').length;
        setPendingCount(pending);
      }
    } catch {}
  };

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : (pathname.startsWith(href) && href !== '/admin') ||
        (pathname === '/admin' && href === '/admin');

  const currentOption = navItems.find(({ href, exact }) => isActive(href, exact))?.href || '/admin';

  const selectOptions = navItems.map(({ href, label, icon: Icon }) => ({
    value: href,
    label: label === 'Requests' && pendingCount > 0 ? `${label} (${pendingCount})` : label,
    icon: <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />,
  }));

  return (
    <>
      {/* Mobile Section Switcher Dropdown */}
      <div className="md:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-surface-200/90 px-4 py-2.5 shadow-2xs mb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin Section
          </span>
          <div className="relative flex-1 max-w-[240px]">
            <AnimatedSelect
              options={selectOptions}
              value={currentOption}
              onChange={(val) => router.push(val)}
            />
          </div>
        </div>
      </div>

      {/* Desktop Sticky Sidebar Card */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 sticky top-20 self-start space-y-3">
        {/* Logo Option Over Admin Controls Box */}
        <div className="card px-4 py-3 border border-surface-200/90 shadow-card rounded-2xl bg-white flex items-center justify-between">
          <Link href="/" title="Go to Platform Home">
            <DipDeskLogo />
          </Link>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            Admin
          </span>
        </div>

        <div className="card p-3.5 border border-surface-200/90 shadow-card rounded-3xl bg-white space-y-1">
          {/* Header Title */}
          <div className="px-3.5 py-2.5 mb-1.5 border-b border-surface-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6.5 h-6.5 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs uppercase tracking-wider text-gray-700 whitespace-nowrap truncate">
                Admin Controls
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
              Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors duration-150 group',
                    active ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {/* Sliding gradient pill — shared layout animation */}
                  {active && (
                    <motion.span
                      layoutId="desktop-admin-pill"
                      layout="position"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 shadow-md shadow-primary-500/25"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  {/* Hover layer for inactive items */}
                  {!active && (
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-surface-100/70 transition-opacity duration-150" />
                  )}

                  <Icon
                    className={cn(
                      'relative z-10 w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                      active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                    )}
                  />
                  <span className="relative z-10 flex-1 truncate">{label}</span>

                  {label === 'Requests' && pendingCount > 0 && (
                    <span
                      className={cn(
                        'relative z-10 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full transition-colors',
                        active
                          ? 'bg-white text-primary-700'
                          : 'bg-amber-500 text-white group-hover:bg-amber-600'
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
