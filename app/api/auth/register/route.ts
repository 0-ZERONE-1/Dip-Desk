import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { findUserByEmailStore, createUserStore } from '@/lib/store';

// ─── Simple in-memory rate limiter ──────────────────────────────────────────
// Max 5 registration attempts per IP per 15 minutes
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // blocked
  }

  entry.count += 1;
  return true; // allowed
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again after 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Generate random 5 digit user name format e.g. User #48291
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const defaultUserName = `User #${random5Digits}`;
    const finalName = (name && !name.includes('@') && name.trim() !== '') ? name : defaultUserName;

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if user exists in local store
    const existingStoreUser = await findUserByEmailStore(lowerEmail);
    if (existingStoreUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Check DB if connected
    try {
      await dbConnect();
      const existingDbUser = await User.findOne({ email: lowerEmail });
      if (existingDbUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    } catch {}

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to local store
    const localUser = await createUserStore({
      name: finalName,
      email: lowerEmail,
      password,
      hashedPassword,
      role: 'student',
      isProfileComplete: true,
    });

    // Save to MongoDB if available
    try {
      await dbConnect();
      await User.create({
        name: finalName,
        email: lowerEmail,
        hashedPassword,
        role: 'student',
        isProfileComplete: true,
      });
    } catch {}

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { email: localUser.email, name: localUser.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to register account' }, { status: 500 });
  }
}
