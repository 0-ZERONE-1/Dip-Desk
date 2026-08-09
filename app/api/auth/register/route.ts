import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { findUserByEmailStore, createUserStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

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
      name,
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
        name,
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
