'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, BookOpen, LogOut, Settings, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavbarSearch from '@/components/NavbarSearch';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasRecentNotice, setHasRecentNotice] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/notices')
      .then((r) => r.json())
      .then((data) => {
        const notices = data.notices || [];
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const recent = notices.some((n: any) => {
          const created = new Date(n.createdAt).getTime();
          return now - created <= threeDaysMs;
        });
        setHasRecentNotice(recent);
      })
      .catch(() => {});
  }, []);

  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-surface-200'
            : 'bg-white border-b border-surface-200'
        )}
      >
        <div className="w-full max-w-[1700px] mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-8 lg:px-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-base">Dip-</span>
                <span className="font-bold gradient-text text-base">Desk</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className={cn('nav-item', pathname === '/' && 'nav-item-active')}>
                Home
              </Link>
              <Link href="/browse" className={cn('nav-item', pathname.startsWith('/browse') && 'nav-item-active')}>
                Browse
              </Link>
              <Link href="/notices" className={cn('nav-item relative', pathname.startsWith('/notices') && 'nav-item-active')}>
                Notice
                {hasRecentNotice && (
                  <span className="absolute top-2 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm" />
                )}
              </Link>
              <Link href="/developers" className={cn('nav-item', pathname === '/developers' && 'nav-item-active')}>
                Developers
              </Link>
              {status === 'authenticated' && !isAdmin && (
                <Link href="/dashboard" className={cn('nav-item', pathname === '/dashboard' && 'nav-item-active')}>
                  Student Panel
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className={cn('nav-item', pathname.startsWith('/admin') && 'nav-item-active')}>
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Larger Navbar Search input with inline suggestions dropdown */}
              <NavbarSearch />

              {/* Auth Section */}
              {status === 'loading' ? (
                <div className="w-8 h-8 skeleton rounded-full" />
              ) : status === 'authenticated' ? (
                <div className="relative">
                  <button
                    id="profile-menu-btn"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-200 hover:border-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-modal border border-surface-200 z-20 py-1.5 animate-scale-in">
                        <div className="px-4 py-3 border-b border-surface-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="badge-primary mt-1 text-xs">Administrator</span>
                          )}
                        </div>
                        <div className="py-1">
                          {!isAdmin && (
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-surface-50 font-semibold"
                              onClick={() => setProfileOpen(false)}
                            >
                              <User className="w-4 h-4 text-blue-600" />
                              Student Panel
                            </Link>
                          )}
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-surface-50 font-semibold"
                              onClick={() => setProfileOpen(false)}
                            >
                              <Settings className="w-4 h-4 text-purple-600" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-surface-100 py-1">
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-btn"
                className="md:hidden btn-ghost p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Menu Overlay */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} session={session} hasRecentNotice={hasRecentNotice} />
    </>
  );
}
