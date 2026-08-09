'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { X, Home, BookOpen, Bookmark, Settings, LogIn, LogOut, Code2, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Session } from 'next-auth';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  hasRecentNotice?: boolean;
}

export default function MobileMenu({ open, onClose, session, hasRecentNotice }: MobileMenuProps) {
  const pathname = usePathname();
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Resources', icon: BookOpen },
    { href: '/notices', label: 'Notice Board', icon: Bell, hasBadge: hasRecentNotice },
    { href: '/developers', label: 'Developers', icon: Code2 },
    ...(session ? [{ href: '/dashboard', label: 'My Library', icon: Bookmark }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: Settings }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-modal flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">Dip-Desk</span>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {session && (
              <div className="px-5 py-4 border-b border-surface-100 bg-surface-50">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navLinks.map(({ href, label, icon: Icon, hasBadge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    pathname === href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-surface-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                  {hasBadge && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Footer Auth */}
            <div className="px-3 py-4 border-t border-surface-200">
              {session ? (
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="btn-primary w-full"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In with Google
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
