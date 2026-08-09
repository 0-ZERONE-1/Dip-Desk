'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, Users, MessageSquare, Heart, Building2, BookMarked, LogOut, Menu, X, Code2, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/notices', label: 'Notices', icon: Bell },
  { href: '/admin/resources', label: 'Resources', icon: BookOpen },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/subjects', label: 'Subjects', icon: BookMarked },
  { href: '/admin/developers', label: 'Developers', icon: Code2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { href: '/admin/health-check', label: 'Link Health', icon: Heart },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm">Dip-Desk</span>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/admin' || (pathname === '/admin' && href === '/admin');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary-50 text-primary-700 shadow-xs'
                  : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Admin User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-gray-900 truncate">Administrator</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || 'admin@diplomahub.com'}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0 flex-col z-40">
        <NavContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <span className="font-bold text-gray-900 text-sm">Dip-Desk Admin</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {/* Mobile spacer */}
      <div className="md:hidden h-14" />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
