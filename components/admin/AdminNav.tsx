'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, Users, MessageSquare, Heart, Building2, BookMarked, LogOut, Menu, X, Code2, Bell, ArrowLeft, Globe, RotateCcw
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { clearAllClientStorage } from '@/lib/clientStore';

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
      {/* Logo & Back to Main Site */}
      <div className="px-5 py-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm">Dip-Desk</span>
            <p className="text-[11px] text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Back to Website Button */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-surface-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-bold rounded-xl text-xs transition-all border border-surface-200 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Main Site</span>
        </Link>
      </div>

      {/* Nav Items */}
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

      {/* Admin User Info Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => {
            clearAllClientStorage();
            toast.success('Local browser cache cleared! Synced with live DB.');
            setTimeout(() => window.location.reload(), 500);
          }}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl text-xs transition-all border border-primary-200"
          title="Clear local browser cache and force load live database data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sync Live DB / Clear Cache</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div className="truncate">
            <p className="text-xs font-bold text-gray-900 truncate">Administrator</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || 'admin@dipdesk.com'}</p>
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
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-bold text-gray-900 text-sm">Dip-Desk Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
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
