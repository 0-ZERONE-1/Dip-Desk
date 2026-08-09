import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Admin from '@/lib/models/Admin';
import { findUserByEmailStore } from '@/lib/store';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      id: 'user-credentials',
      name: 'Student Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail = credentials.email.toLowerCase().trim();

        // 1. Check Demo / Default Student Account
        if (
          (inputEmail === 'student@diplomahub.com' || inputEmail === 'demo@diplomahub.com' || inputEmail === 'student@dipdesk.com' || inputEmail === 'demo@dipdesk.com') &&
          (credentials.password === 'Student@123' || credentials.password === 'student123' || credentials.password === 'Demo@123')
        ) {
          return {
            id: 'demo_student_id',
            email: 'student@dipdesk.com',
            name: 'Demo Student',
            role: 'student',
            isProfileComplete: true,
          };
        }

        // 2. Check local store users (fallback & registered users)
        try {
          const storeUser = await findUserByEmailStore(inputEmail);
          if (storeUser) {
            let isValid = false;
            if (storeUser.hashedPassword) {
              isValid = await bcrypt.compare(credentials.password, storeUser.hashedPassword);
            } else if (storeUser.password) {
              isValid = credentials.password === storeUser.password;
            } else {
              isValid = true; // demo accounts
            }
            if (isValid) {
              return {
                id: storeUser._id,
                email: storeUser.email,
                name: storeUser.name,
                role: storeUser.role || 'student',
                isProfileComplete: storeUser.isProfileComplete ?? true,
              };
            }
          }
        } catch {}

        // 3. Check MongoDB Users
        try {
          await dbConnect();
          const user = await User.findOne({ email: inputEmail });
          if (user) {
            if (user.isBanned) return null;
            let isValid = false;
            if (user.hashedPassword) {
              isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
            }
            if (isValid) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role || 'student',
                isProfileComplete: user.isProfileComplete,
              };
            }
          }
        } catch (e) {
          console.warn('DB check error during student login:', e);
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@diplomahub.com').toLowerCase();
        const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123';

        const inputEmail = credentials.email.toLowerCase().trim();

        // Default admin credentials fallback for instant login
        if (
          (inputEmail === defaultAdminEmail || inputEmail === 'admin@dipdesk.com' || inputEmail === 'admin@diplomahub.com') &&
          credentials.password === defaultAdminPass
        ) {
          return {
            id: 'admin_default_id',
            email: 'admin@dipdesk.com',
            name: 'Administrator',
            role: 'admin',
          };
        }

        try {
          await dbConnect();
          const admin = await Admin.findOne({ email: inputEmail });
          if (admin) {
            const isValid = await bcrypt.compare(credentials.password, admin.hashedPassword);
            if (isValid) {
              return {
                id: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                role: 'admin',
              };
            }
          }
        } catch (e) {
          console.warn('DB check error during admin login:', e);
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            googleId: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'student',
            isProfileComplete: false,
          });
        } else if (existingUser.isBanned) {
          return false; // Block banned users
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
      }

      if (account?.provider === 'google' && token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.isProfileComplete = dbUser.isProfileComplete;
          token.isBanned = dbUser.isBanned;
        }
      }

      if ((user as any)?.role === 'admin') {
        token.role = 'admin';
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).isProfileComplete = token.isProfileComplete as boolean;
        (session.user as any).isBanned = token.isBanned as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || 'dip-desk-super-secret-production-key-2026-xyz-987654321',
};
