'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Mail, Lock, ArrowRight, Loader2,
  GraduationCap, ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Tab = 'student' | 'admin';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push('/');
  }, [session, router]);

  // Reset fields when switching tabs
  const switchTab = (t: Tab) => {
    setTab(t);
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  if (status === 'loading') return null;

  /* ---- Student login ---- */
  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    const res = await signIn('user-credentials', { email, password, redirect: false });
    if (res?.error) { toast.error('Invalid email or password'); setLoading(false); }
    else { toast.success('Signed in successfully!'); router.push('/'); }
  };


  /* ---- Admin login ---- */
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    try {
      const res = await signIn('admin-credentials', { email, password, redirect: false });
      if (res?.error) { toast.error('Invalid admin credentials'); setLoading(false); }
      else { toast.success('Welcome back, Admin!'); router.push('/admin'); }
    } catch {
      toast.error('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const isAdmin = tab === 'admin';

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-10">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
        {isAdmin && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-all duration-500" />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md transition-all duration-300 ${
            isAdmin
              ? 'bg-gradient-to-br from-gray-700 to-gray-900'
              : 'bg-gradient-to-br from-primary-600 to-accent-500'
          }`}>
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className={`text-2xl font-extrabold transition-colors duration-300 ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Dip-Desk
          </h1>
          <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isAdmin ? 'text-gray-400' : 'text-gray-500'}`}>
            {isAdmin ? 'Administrator Management Console' : 'Sign in to access study materials and save bookmarks'}
          </p>
        </div>

        <motion.div
          layout
          transition={{ layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
          className={`rounded-2xl shadow-modal overflow-hidden transition-colors duration-300 ${
            isAdmin ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-surface-200'
          }`}
        >

          {/* ===== Tab Switcher ===== */}
          <div className={`p-2 ${isAdmin ? 'bg-gray-800/60' : 'bg-surface-50'} border-b ${isAdmin ? 'border-gray-700' : 'border-surface-200'}`}>
            <div className={`flex gap-1 p-1 rounded-xl ${isAdmin ? 'bg-gray-700/50' : 'bg-surface-100'}`}>
              <button
                id="tab-student"
                onClick={() => switchTab('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isAdmin
                    ? 'bg-white text-primary-700 shadow-sm border border-primary-100'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                id="tab-admin"
                onClick={() => switchTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isAdmin
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          <motion.div layout className="p-6 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">

              {/* ===== STUDENT PANEL ===== */}
              {!isAdmin && (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                >
                  {/* Email / Password Form */}
                  <form onSubmit={handleStudentSignIn} className="space-y-4 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="student@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      id="student-signin-btn"
                      disabled={loading}
                      className="btn-primary w-full py-3 justify-center text-sm"
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><span>Sign In with Email</span><ArrowRight className="w-4 h-4 ml-1" /></>
                      }
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-surface-200 w-full" />
                    <span className="bg-white px-3 text-xs font-medium text-gray-400 absolute">or</span>
                  </div>

                  {/* Google Sign In */}
                  <button
                    id="google-signin-btn"
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-3 px-5 py-2.5 bg-white border border-surface-200 hover:border-primary-300 rounded-xl font-semibold text-xs text-gray-700 hover:bg-surface-50 transition-all duration-200 shadow-sm mb-5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Register */}
                  <p className="text-center text-xs text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary-600 font-bold hover:underline">
                      Register with Email →
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* ===== ADMIN PANEL ===== */}
              {isAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                >
                  {/* Admin badge */}
                  <div className="mb-6 flex items-center gap-2.5 px-4 py-3 bg-red-950/60 border border-red-700/50 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-300">Restricted Access</p>
                      <p className="text-[11px] text-red-500/70">This area is for administrators only</p>
                    </div>
                  </div>

                  <form onSubmit={handleAdminSignIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-email"
                          type="email"
                          placeholder="admin@diplomahub.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      id="admin-login-btn"
                      disabled={loading}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 mt-2"
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><ShieldCheck className="w-4 h-4" /><span>Sign In as Administrator</span></>
                      }
                    </button>
                  </form>


                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
