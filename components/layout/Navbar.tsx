/**
 * Developer: Subrata Roy
 * Date: 08-29-2026
 * Warning: Must test before merge into main
 * 
 * Note: Fixed responsive navbar issues that made the overall page look
 * broken on tablets and small phones:
 *  - Removed invalid `xs:` breakpoint (not a real Tailwind screen) that
 *    was silently doing nothing on the mobile search bar.
 *  - Split header layout at `lg:` instead of `md:` so tablets (768–1023px)
 *    get the compact mobile header instead of a cramped desktop layout
 *    with 5 links + search + logo + avatar fighting for space.
 *  - Added `min-w-0` to flexible containers so search/nav no longer
 *    overflow next to fixed-width siblings (logo, avatar, menu button).
 *  - Tightened padding/gaps and font size on very small phones (320–360px)
 *    to prevent horizontal overflow next to the logo and menu icon.
 *  - Extracted duplicated avatar button markup into a single AvatarButton
 *    component used by both mobile and desktop headers.
 */
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

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const centerNavProps = {
    initial: { y: -65, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1.4, ease: [0.42, 0, 0.58, 1], delay: 0.9 },
  };

  const mobileNavProps = {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1.2, ease: [0.42, 0, 0.58, 1], delay: 0.9 },
  };

  const handleAccountClick = () => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const AvatarButton = ({ id, size = 'w-8 h-8' }: { id: string; size?: string }) => (
    <button
      id={id}
      onClick={handleAccountClick}
      title={isAdmin ? 'Go to Admin Panel' : 'Go to Student Panel'}
      className={cn(
        size,
        'rounded-full overflow-hidden border-2 border-surface-200 hover:border-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer flex-shrink-0'
      )}
    >
      {user?.image ? (
        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* COMPACT HEADER: phones + tablets (lg:hidden) */}
      {/* ========================================================================= */}
      <motion.header
        {...mobileNavProps}
        className="lg:hidden fixed top-0 inset-x-0 z-50 pointer-events-auto bg-white/95 backdrop-blur-xl border-b border-surface-200/90 shadow-sm px-2.5 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-3"
      >
        <Link href="/" className="flex-shrink-0">
          <DipDeskLogo />
        </Link>

        {/* Search grows to fill available space but never pushes icons off-screen */}
        <div className="flex-1 min-w-0">
          <NavbarSearch />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {status === 'loading' ? (
            <div className="w-8 h-8 skeleton rounded-full" />
          ) : status === 'authenticated' ? (
            <AvatarButton id="profile-menu-btn-mobile" />
          ) : (
            <Link
              href="/login"
              className="btn-primary rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs whitespace-nowrap"
            >
              Sign In
            </Link>
          )}

          <button
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            className="btn-ghost p-1.5 rounded-full flex-shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* ========================================================================= */}
      {/* FULL DESKTOP HEADER (hidden below lg) */}
      {/* ========================================================================= */}
      <motion.header
        {...centerNavProps}
        className="hidden lg:flex fixed top-0 inset-x-0 z-50 pointer-events-auto w-full justify-center px-4 xl:px-6 mt-0"
      >
        <div
          className={cn(
            'w-full max-w-7xl rounded-b-2xl xl:rounded-b-[28px] transition-all duration-300 px-4 xl:px-6 py-2 flex items-center justify-between gap-3 xl:gap-4 border-b border-x shadow-lg shadow-gray-900/5',
            scrolled
              ? 'bg-white/95 backdrop-blur-xl border-surface-200/90 shadow-primary-900/10'
              : 'bg-white/90 backdrop-blur-lg border-surface-200/80 shadow-gray-900/5'
          )}
        >
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <DipDeskLogo />
            </Link>
          </div>

          {/* Center: Links & Search */}
          <div className="flex items-center gap-3 xl:gap-6 flex-1 justify-center min-w-0 max-w-3xl">
            <nav className="flex items-center gap-0.5 xl:gap-1 flex-shrink-0">
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
                        'relative px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-colors duration-200 group flex items-center justify-center overflow-hidden',
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
                      <span className="relative z-10 whitespace-nowrap">{label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex-1 max-w-xs min-w-[140px]">
              <NavbarSearch />
            </div>
          </div>

          {/* Right: Account */}
          <div className="flex-shrink-0">
            {status === 'loading' ? (
              <div className="w-8 h-8 xl:w-9 xl:h-9 skeleton rounded-full" />
            ) : status === 'authenticated' ? (
              <AvatarButton id="profile-menu-btn" size="w-8 h-8 xl:w-9 xl:h-9" />
            ) : (
              <Link
                href="/login"
                className="btn-primary rounded-full px-4 py-1.5 text-xs xl:text-sm whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Spacer matching header height across breakpoints */}
      <div className="h-14 sm:h-16 lg:h-20" />

      {/* Mobile Menu Overlay */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} session={session} />
    </>
  );
}