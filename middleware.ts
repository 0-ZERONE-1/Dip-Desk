import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dip-desk-super-secret-production-key-2026-xyz-987654321';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/auth') {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Student protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/complete-profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Redirect banned users
    if (token.isBanned) {
      return NextResponse.redirect(new URL('/banned', req.url));
    }
  }

  // Force profile completion for students
  if (token && token.role === 'student' && !token.isProfileComplete) {
    if (!pathname.startsWith('/complete-profile') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/complete-profile/:path*'],
};
