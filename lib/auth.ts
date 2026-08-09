import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Admin from '@/lib/models/Admin';
import { findUserByEmailStore } from '@/lib/store';

export const authOptions: NextAuthOptions = {
  providers: [
    // --- STUDENT LOGIN ---
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

        // 1. Check local store registered users
        try {
          const storeUser = await findUserByEmailStore(inputEmail);
          if (storeUser) {
            let isValid = false;
            if (storeUser.hashedPassword) {
              isValid = await bcrypt.compare(credentials.password, storeUser.hashedPassword);
            } else if (storeUser.password) {
              isValid = credentials.password === storeUser.password;
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

        // 2. Check MongoDB registered users
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
                isProfileComplete: user.isProfileComplete ?? true,
              };
            }
          }
        } catch (e) {
          console.warn('DB check error during student login:', e);
        }

        return null;
      },
    }),

    // --- ADMIN LOGIN ---
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail = credentials.email.toLowerCase().trim();

        // Strict Admin Credentials
        if (inputEmail === 'admin@dipdesk.com' && credentials.password === 'Admin.dipdesk') {
          return {
            id: 'admin_default_id',
            email: 'admin@dipdesk.com',
            name: 'Administrator',
            role: 'admin',
          };
        }

        // Check MongoDB Admin model if present
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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id || token.id;
        token.role = (user as any).role || 'student';
        token.isProfileComplete = (user as any).isProfileComplete ?? true;
      }

      if (trigger === 'update') {
        token.isProfileComplete = true;
      }

      if ((user as any)?.role === 'admin' || token.role === 'admin') {
        token.role = 'admin';
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
