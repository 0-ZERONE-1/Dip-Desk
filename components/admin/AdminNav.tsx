'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
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

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/notices', label: 'Notices', icon: Bell },
  { href: '/admin/resources', label: 'Resources', icon: BookOpen },
  { href: '/admin/subjects', label: 'Subjects', icon: BookMarked },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/developers', label: 'Developers', icon: Code2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { href: '/admin/cheat', label: 'Cheat', icon: Zap },
  { href: '/admin/health-check', label: 'Link Health', icon: Heart },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : (pathname.startsWith(href) && href !== '/admin') ||
        (pathname === '/admin' && href === '/admin');

  return (
    <>
      {/* Mobile Horizontal Sub-Navigation Tabs Bar */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar py-2 -mx-3.5 px-3.5 flex items-center gap-1.5 border-b border-surface-200/80 bg-white sticky top-16 z-30 shadow-2xs">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-150 shadow-2xs',
                active
                  ? 'text-white'
                  : 'bg-surface-50 text-gray-700 hover:bg-surface-100 border border-surface-200/90'
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-admin-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 shadow-md shadow-primary-500/25"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5 flex-shrink-0" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sticky Sidebar Card */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 sticky top-20 self-start">
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
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 shadow-md shadow-primary-500/25"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  {/* Hover layer for inactive items */}
                  {!active && (
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-surface-100 transition-opacity duration-150" />
                  )}
                  <Icon
                    className={cn(
                      'relative z-10 w-4 h-4 transition-colors',
                      active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                    )}
                  />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Utilities */}
          <div className="pt-3 mt-2 border-t border-surface-100">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || 'admin@dipdesk.com'}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
