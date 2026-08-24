'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDDEN_PATHS = ['/login', '/register', '/banned', '/complete-profile'];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hidden = HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (hidden) return null;
  return <Navbar />;
}
