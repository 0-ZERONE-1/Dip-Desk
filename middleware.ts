import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error('[Middleware] NEXTAUTH_SECRET is not set. Cannot validate JWT tokens.');
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ZERONE - Protect admin-only routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/auth') {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // ZERONE - Protect student dashboard & profile routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/complete-profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // ZERONE - Redirect banned users
    if (token.isBanned) {
      return NextResponse.redirect(new URL('/banned', req.url));
    }
  }

  // ZERONE - Force profile completion for incomplete student accounts
  if (token && token.role === 'student' && token.isProfileComplete === false) {
    if (!pathname.startsWith('/complete-profile') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/complete-profile/:path*'],
};
