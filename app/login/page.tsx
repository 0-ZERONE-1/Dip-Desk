'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Mail, Lock, ArrowRight, Loader2,
  GraduationCap, ShieldCheck, Eye, EyeOff, UserPlus, LogIn
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

  /* ---- Student Sign In ---- */
  const handleStudentSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    const res = await signIn('user-credentials', { email, password, redirect: false });
    if (res?.error) { 
      toast.error('Invalid email or password'); 
      setLoading(false); 
    } else { 
      toast.success('Signed in successfully!'); 
      router.push('/'); 
    }
  };

  /* ---- Student Register ---- */
  const handleStudentRegister = async () => {
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: email.split('@')[0] }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If already registered, attempt login directly
        if (data.error?.includes('already exists') || data.error?.includes('already registered')) {
          const signInRes = await signIn('user-credentials', { email, password, redirect: false });
          if (signInRes?.error) toast.error('Account already exists with a different password');
          else { toast.success('Signed in successfully!'); router.push('/'); }
          setLoading(false);
          return;
        }
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      // Successfully registered, auto sign-in
      const signInRes = await signIn('user-credentials', { email, password, redirect: false });
      if (signInRes?.error) toast.error('Account registered! Please sign in.');
      else { toast.success('Account registered & signed in! 🎉'); router.push('/'); }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Admin Login ---- */
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      const res = await signIn('admin-credentials', { email, password, redirect: false });
      if (res?.error) { 
        toast.error('Invalid admin credentials'); 
        setLoading(false); 
      } else { 
        toast.success('Welcome back, Admin!'); 
        router.push('/admin'); 
      }
    } catch {
      toast.error('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const isAdmin = tab === 'admin';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-500 ${
      isAdmin ? 'bg-gray-950 text-white' : 'hero-gradient text-gray-900'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
          isAdmin ? 'bg-purple-900/30' : 'bg-blue-400/20'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
          isAdmin ? 'bg-violet-900/30' : 'bg-indigo-400/20'
        }`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-all duration-500 ${
            isAdmin
              ? 'bg-gradient-to-br from-purple-600 to-violet-700 shadow-purple-600/30'
              : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/30'
          }`}>
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className={`text-2xl font-extrabold transition-colors duration-500 ${
            isAdmin ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to Dip-Desk
          </h1>
          <p className={`text-xs sm:text-sm mt-1 transition-colors duration-500 ${
            isAdmin ? 'text-purple-300/80' : 'text-gray-500'
          }`}>
            {isAdmin ? 'Administrator Management Console' : 'Sign in or register to access study materials'}
          </p>
        </div>

        {/* Main Card Container */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
          className={`rounded-2xl shadow-modal overflow-hidden transition-all duration-500 ${
            isAdmin
              ? 'bg-gray-900 border border-purple-900/40 shadow-purple-950/50'
              : 'bg-white border border-surface-200 shadow-xl'
          }`}
        >

          {/* ===== Tab Switcher ===== */}
          <div className={`p-2 transition-colors duration-500 ${
            isAdmin ? 'bg-gray-900/80 border-b border-gray-800' : 'bg-surface-50 border-b border-surface-200'
          }`}>
            <div className={`flex gap-1 p-1 rounded-xl transition-colors duration-500 ${
              isAdmin ? 'bg-gray-800/80' : 'bg-surface-100'
            }`}>
              <button
                id="tab-student"
                type="button"
                onClick={() => switchTab('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isAdmin
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                id="tab-admin"
                type="button"
                onClick={() => switchTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isAdmin
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleStudentSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="student@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input pl-10 focus:ring-blue-500 focus:border-blue-500"
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
                          className="input pl-10 pr-10 focus:ring-blue-500 focus:border-blue-500"
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

                    {/* Dual Action Buttons: Register & Sign In */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        id="student-register-btn"
                        onClick={handleStudentRegister}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /><span>Register</span></>}
                      </button>

                      <button
                        type="submit"
                        id="student-signin-btn"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-blue-500/20"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ===== ADMIN PANEL ===== */}
              {isAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleAdminSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-email"
                          type="email"
                          placeholder="admin@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 mt-4 transition-all duration-200 shadow-md shadow-purple-600/30"
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
