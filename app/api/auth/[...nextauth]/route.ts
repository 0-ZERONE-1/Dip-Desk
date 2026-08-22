import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const handler = NextAuth(authOptions);

// Rate limit: max 10 login attempts per IP per 15 minutes
async function rateLimitedHandler(req: NextRequest) {
  // Only rate-limit POST (sign-in) requests, not GET (session check)
  if (req.method === 'POST') {
    const ip = getClientIp(req);
    const allowed = checkRateLimit(ip, { name: 'login', max: 10, windowMs: 15 * 60 * 1000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }
  }
  return handler(req as any, {} as any);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
