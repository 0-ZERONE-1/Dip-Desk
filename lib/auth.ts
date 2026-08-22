import { NextAuthOptions } from 'next-auth';

// Fail loudly at startup if the secret is missing — never use a hardcoded fallback
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    '[Auth] NEXTAUTH_SECRET environment variable is not set. ' +
    'Set it in .env.local for development and in your hosting provider\'s env vars for production.'
  );
}
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
            // Only accept bcrypt-hashed passwords — never compare plaintext
            if (storeUser.hashedPassword) {
              try {
                isValid = await bcrypt.compare(credentials.password, storeUser.hashedPassword);
              } catch {}
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

        // Strict Admin Credentials (reads exclusively from ADMIN_EMAIL & ADMIN_PASSWORD env vars)
        const targetAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : '';
        const targetAdminPassword = process.env.ADMIN_PASSWORD || '';

        if (targetAdminEmail && targetAdminPassword && inputEmail === targetAdminEmail && credentials.password === targetAdminPassword) {
          return {
            id: 'admin_default_id',
            email: targetAdminEmail,
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
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = (user as any).id || token.id;
        token.name = user.name || token.name;
        token.role = (user as any).role || 'student';
        token.isProfileComplete = (user as any).isProfileComplete ?? true;
        token.isBanned = (user as any).isBanned ?? false;
      }

      if (trigger === 'update') {
        token.isProfileComplete = true;
        if (updateData?.name) token.name = updateData.name;
      }

      if ((user as any)?.role === 'admin' || token.role === 'admin') {
        token.role = 'admin';
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        if (token.name) session.user.name = token.name as string;
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

  secret: process.env.NEXTAUTH_SECRET,
};
