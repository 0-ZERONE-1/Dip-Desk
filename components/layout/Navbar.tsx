'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  const topNavItems = [
    { href: '/', label: 'Home', exact: true },
    { href: '/browse', label: 'Browse', exact: false },
    { href: '/notices', label: 'Notice', exact: false },
    { href: '/developers', label: 'Developers', exact: true },
    { href: '/about', label: 'About', exact: true },
    ...(status === 'authenticated' && !isAdmin ? [{ href: '/dashboard', label: 'Student Panel', exact: true }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', exact: false }] : []),
  ];

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
            <nav className="hidden md:flex items-center gap-1.5">
              {topNavItems.map(({ href, label, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <motion.div
                    key={href}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  >
                    <Link
                      href={href}
                      className={cn(
                        'relative px-3.5 py-1.5 rounded-xl text-sm font-bold transition-colors duration-200 group flex items-center justify-center overflow-hidden',
                        active ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {active ? (
                        <motion.span
                          initial={{ scale: 0.88, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 shadow-md shadow-primary-500/30"
                        />
                      ) : (
                        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-surface-100/80 transition-all duration-200" />
                      )}
                      <span className="relative z-10">{label}</span>
                    </Link>
                  </motion.div>
                );
              })}
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
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} session={session} />
    </>
  );
}
