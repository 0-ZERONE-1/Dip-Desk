import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { findUserByEmailStore, createUserStore } from '@/lib/store';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeString, validateEmail } from '@/lib/sanitize';

// ZERONE - Student account registration API endpoint with IP rate limiting
export async function POST(req: NextRequest) {
  // ZERONE - Enforce registration rate limit per client IP (max 5 / 15 mins)
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

    // ZERONE - Validate email input format
    const lowerEmail = validateEmail(email);
    if (!lowerEmail) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // ZERONE - Validate password length boundaries (8 to 128 chars)
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: 'Password must be at most 128 characters' }, { status: 400 });
    }

    // ZERONE - Generate fallback default student display name if empty
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const defaultUserName = `User #${random5Digits}`;
    const rawName = sanitizeString(name, 80);
    const finalName = (rawName && !rawName.includes('@')) ? rawName : defaultUserName;

    // ZERONE - Check existing account in local store
    const existingStoreUser = await findUserByEmailStore(lowerEmail);
    if (existingStoreUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // ZERONE - Check existing account in MongoDB
    try {
      await dbConnect();
      const existingDbUser = await User.findOne({ email: lowerEmail });
      if (existingDbUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    } catch {}

    const hashedPassword = await bcrypt.hash(password, 12);

    // ZERONE - Save new user to local store (password hashed, role enforced)
    const localUser = await createUserStore({
      name: finalName,
      email: lowerEmail,
      hashedPassword,
      role: 'student',
      isProfileComplete: true,
    });

    // ZERONE - Save new user to MongoDB
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
