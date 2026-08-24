'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavbarSearch from '@/components/NavbarSearch';
import MobileMenu from './MobileMenu';
import DipDeskLogo from './DipDeskLogo';

// Persistent client-side flag to disable entrance animations on route transitions
let hasNavbarAnimated = false;

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!hasNavbarAnimated) {
      setShouldAnimate(true);
      hasNavbarAnimated = true;
    }
  }, []);

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
  ];

  // Entrance animations only on hard load/refresh — skipped on route changes
  const centerNavProps = shouldAnimate ? {
    initial: { y: -65, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1.4, ease: [0.42, 0, 0.58, 1], delay: 0.9 },
  } : {};

  const topLeftLogoProps = shouldAnimate ? {
    initial: { x: -85, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1.4, ease: [0.42, 0, 0.58, 1], delay: 1.0 },
  } : {};

  const topRightAccountProps = shouldAnimate ? {
    initial: { x: 85, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 1.4, ease: [0.42, 0, 0.58, 1], delay: 1.0 },
  } : {};

  const mobileNavProps = shouldAnimate ? {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1.2, ease: [0.42, 0, 0.58, 1], delay: 0.9 },
  } : {};

  const handleAccountClick = () => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE UNIFIED SINGLE JOINT HEADER PANEL (md:hidden)                      */}
      {/* ========================================================================= */}
      <motion.header
        {...mobileNavProps}
        className="md:hidden fixed top-0 inset-x-0 z-50 pointer-events-auto bg-white/95 backdrop-blur-xl border-b border-surface-200/90 shadow-sm px-3.5 py-2 flex items-center justify-between gap-2"
      >
        <Link href="/" className="flex-shrink-0">
          <DipDeskLogo />
        </Link>

        <div className="flex-1 max-w-[190px] xs:max-w-[220px] sm:max-w-[260px] min-w-0">
          <NavbarSearch />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {status === 'loading' ? (
            <div className="w-8 h-8 skeleton rounded-full" />
          ) : status === 'authenticated' ? (
            <button
              id="profile-menu-btn-mobile"
              onClick={handleAccountClick}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-surface-200 focus:outline-none cursor-pointer"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>
          ) : (
            <Link href="/login" className="btn-primary rounded-full px-3 py-1 text-xs">
              Sign In
            </Link>
          )}

          <button
            id="mobile-menu-btn"
            className="btn-ghost p-1.5 rounded-full"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* ========================================================================= */}
      {/* DESKTOP HEADER ISLANDS (hidden md:block / md:flex)                        */}
      {/* ========================================================================= */}

      {/* Top-Left Logo Island (slides in from left) */}
      <motion.div
        {...topLeftLogoProps}
        className="hidden md:block fixed top-0 left-0 z-50 pointer-events-auto"
      >
        <div
          className={cn(
            'rounded-br-2xl sm:rounded-br-[24px] transition-all duration-300 px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 border-b border-r shadow-lg shadow-gray-900/5',
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border-surface-200/90 shadow-primary-900/10'
              : 'bg-white/90 backdrop-blur-lg border-surface-200/80 shadow-gray-900/5'
          )}
        >
          <Link href="/">
            <DipDeskLogo />
          </Link>
        </div>
      </motion.div>

      {/* Top-Center Navigation Bar Island (slides down from top) */}
      <motion.header
        {...centerNavProps}
        className="hidden md:flex fixed top-0 inset-x-0 mx-auto z-40 pointer-events-auto w-fit justify-center"
      >
        <div
          className={cn(
            'rounded-b-2xl sm:rounded-b-[28px] transition-all duration-300 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-3 border-b border-x shadow-lg shadow-gray-900/5',
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border-surface-200/90 shadow-primary-900/10'
              : 'bg-white/90 backdrop-blur-lg border-surface-200/80 shadow-gray-900/5'
          )}
        >
          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1">
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
                      'relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 group flex items-center justify-center overflow-hidden',
                      active ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {active ? (
                      <motion.span
                        initial={{ scale: 0.88, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 shadow-md shadow-primary-500/30"
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-surface-100/80 transition-all duration-200" />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Search Input */}
          <NavbarSearch />
        </div>
      </motion.header>

      {/* Top-Right Account / Profile Island (slides in from right) */}
      <motion.div
        {...topRightAccountProps}
        className="hidden md:block fixed top-0 right-0 z-50 pointer-events-auto"
      >
        <div
          className={cn(
            'rounded-bl-2xl sm:rounded-bl-[24px] transition-all duration-300 px-3.5 sm:px-4.5 py-2 sm:py-2.5 flex items-center gap-2 border-b border-l shadow-lg shadow-gray-900/5',
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border-surface-200/90 shadow-primary-900/10'
              : 'bg-white/90 backdrop-blur-lg border-surface-200/80 shadow-gray-900/5'
          )}
        >
          {status === 'loading' ? (
            <div className="w-8 h-8 skeleton rounded-full" />
          ) : status === 'authenticated' ? (
            <button
              id="profile-menu-btn"
              onClick={handleAccountClick}
              title={isAdmin ? 'Go to Admin Panel' : 'Go to Student Panel'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-surface-200 hover:border-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>
          ) : (
            <Link href="/login" className="btn-primary rounded-full px-4 py-1.5 text-xs sm:text-sm">
              Sign In
            </Link>
          )}
        </div>
      </motion.div>

      {/* Spacer matching header height */}
      <div className="h-14 sm:h-16 md:h-24" />

      {/* Mobile Menu Overlay */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} session={session} />
    </>
  );
}
