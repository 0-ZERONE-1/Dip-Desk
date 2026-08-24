'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
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
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

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
    } catch { }
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
      {/* Mobile Section Switcher Dropdown — matches student dashboard style */}
      {(() => {
        const currentItem = navItems.find(({ href, exact }) => isActive(href, exact)) || navItems[0];
        const CurrentIcon = currentItem.icon;
        return (
          <div className="md:hidden w-full px-3.5 pt-2 mb-1 sticky top-15 z-30">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-surface-200/90 shadow-sm p-1.5 relative">
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-50 hover:bg-surface-100/80 border border-surface-200/80 transition-all font-bold text-xs text-gray-900"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6.5 h-6.5 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 font-bold">
                    <CurrentIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{currentItem.label}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-[11px] font-semibold flex-shrink-0">
                  <span className="text-gray-400">Switch Section</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileDropdownOpen && 'rotate-180')} />
                </div>
              </button>

              <AnimatePresence>
                {mobileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-surface-200 shadow-xl z-50 overflow-hidden p-2 grid grid-cols-2 gap-1.5"
                  >
                    {navItems.map(({ href, label, icon: Icon, exact }) => {
                      const active = isActive(href, exact);
                      return (
                        <button
                          key={href}
                          onClick={() => {
                            router.push(href);
                            setMobileDropdownOpen(false);
                          }}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left',
                            active
                              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-surface-100'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })()}

      {/* Desktop Sticky Sidebar Card - Fixed position locked to viewport */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 fixed top-20 left-3.5 sm:left-6 lg:left-8 z-30 h-[calc(100vh-80px)] overflow-y-auto pb-6 pt-2 space-y-3">
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

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-surface-100 mt-2">
            <button
              id="admin-signout-btn"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 transition-all duration-150 group"
            >
              <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
