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
                          placeholder="admin@example.com"
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
