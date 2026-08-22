import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { findUserByEmailStore, createUserStore } from '@/lib/store';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeString, validateEmail } from '@/lib/sanitize';

// ─── Simple in-memory rate limiter ──────────────────────────────────────────
// Max 5 registration attempts per IP per 15 minutes (handled by shared rateLimit.ts)
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = getClientIp(req);

  if (!checkRateLimit(ip, { name: 'register', max: 5, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again after 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate email format
    const lowerEmail = validateEmail(email);
    if (!lowerEmail) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Minimum password length of 8 characters
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Maximum password length to prevent bcrypt DoS (bcrypt silently truncates at 72 bytes)
    if (password.length > 128) {
      return NextResponse.json({ error: 'Password must be at most 128 characters' }, { status: 400 });
    }

    // Generate random 5 digit user name format e.g. User #48291
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const defaultUserName = `User #${random5Digits}`;
    const rawName = sanitizeString(name, 80);
    const finalName = (rawName && !rawName.includes('@')) ? rawName : defaultUserName;

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

    const hashedPassword = await bcrypt.hash(password, 12);

    // Save to local store — NEVER include the raw password
    const localUser = await createUserStore({
      name: finalName,
      email: lowerEmail,
      hashedPassword,
      role: 'student',          // role is always set server-side, never from body
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
