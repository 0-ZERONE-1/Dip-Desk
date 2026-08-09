'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookOpen, User, GraduationCap, Building, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CompleteProfilePage() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: 'Student',
    institute: '',
    regNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.institute || !form.regNumber) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await update(); // Refresh session
      toast.success('Profile complete! Welcome to Dip-Desk 🎉');
      router.push('/');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 shadow-modal">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-sm text-gray-500 mt-2">
              One-time setup before you can access resources
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="full-name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="full-name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="title">
                Title
              </label>
              <select
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="select"
              >
                <option value="Student">Student</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            {/* Institute */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="institute">
                Institute Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="institute"
                  type="text"
                  placeholder="e.g. Government Polytechnic College"
                  value={form.institute}
                  onChange={(e) => setForm({ ...form, institute: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-number">
                Registration / Roll Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="reg-number"
                  type="text"
                  placeholder="e.g. 2023/CST/001"
                  value={form.regNumber}
                  onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="complete-profile-btn"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Saving...' : 'Complete Registration →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
