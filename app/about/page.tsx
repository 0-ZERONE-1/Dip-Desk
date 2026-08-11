'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Code2,
  Cpu,
  Layers,
  Zap,
  ShieldCheck,
  Globe2,
  Sparkles,
  Database,
  Terminal,
  Layout,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Search,
  Bookmark,
  ThumbsUp,
  FileText,
  Workflow,
  UserCheck,
  FilePlus,
  Server,
  Layers3,
} from 'lucide-react';

const softwareTableData = [
  {
    name: 'Next.js',
    version: 'v16.3.0',
    purpose: 'Full-stack React Framework (App Router & Turbopack)',
    category: 'Framework',
    color: 'bg-black text-white',
    badgeClass: 'badge-primary',
  },
  {
    name: 'TypeScript',
    version: 'v5.0.0',
    purpose: 'Strongly typed programming language for robust codebase',
    category: 'Language',
    color: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    name: 'Tailwind CSS / Vanilla CSS',
    version: 'v3.4.1',
    purpose: 'Utility-first & custom HSL CSS engine for modern responsive UI',
    category: 'Styling',
    color: 'bg-cyan-500 text-white',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  {
    name: 'NextAuth.js',
    version: 'v4.24.7',
    purpose: 'Authentication engine for Student & Admin session login',
    category: 'Auth & Security',
    color: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    name: 'Framer Motion',
    version: 'v11.3.8',
    purpose: 'Fluid layout animations & interactive micro-transitions',
    category: 'Animation',
    color: 'bg-pink-600 text-white',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  {
    name: 'MongoDB / Mongoose',
    version: 'v8.5.1',
    purpose: 'NoSQL database with fallback client-side store sync',
    category: 'Database',
    color: 'bg-emerald-600 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    name: 'Lucide React',
    version: 'v0.417.0',
    purpose: 'Modern crisp SVG icons set for accessible UI elements',
    category: 'Iconography',
    color: 'bg-orange-500 text-white',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    name: 'React Hot Toast',
    version: 'v2.4.1',
    purpose: 'Dynamic alert toast notifications across admin & student panels',
    category: 'Notifications',
    color: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    name: 'Fuse.js',
    version: 'v7.0.0',
    purpose: 'Lightweight client-side fuzzy search indexing',
    category: 'Search Engine',
    color: 'bg-yellow-600 text-white',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
];

const platformCapabilities = [
  {
    title: 'Instant Global Search',
    icon: Search,
    color: 'from-blue-500 to-indigo-600',
    desc: 'Sub-second real-time search with dynamic dropdown auto-suggestions across departments, semesters, and subjects.',
  },
  {
    title: 'Inline Document Previewer',
    icon: FileText,
    color: 'from-violet-500 to-purple-600',
    desc: 'Embedded PDF previewer and direct external link access without mandatory downloads.',
  },
  {
    title: 'Personal Bookmarks & Library',
    icon: Bookmark,
    color: 'from-amber-500 to-orange-600',
    desc: 'Save critical exam notes and question papers to your personalized student dashboard for quick revision.',
  },
  {
    title: 'Community Quality Voting',
    icon: ThumbsUp,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Upvote or downvote study materials to help fellow diploma students find top-quality resources.',
  },
  {
    title: 'Personalized Student Profile',
    icon: UserCheck,
    color: 'from-indigo-500 to-blue-600',
    desc: 'Customize full name, title/designation, institute name, and roll/registration number anytime.',
  },
  {
    title: 'Resource Request Pipeline',
    icon: FilePlus,
    color: 'from-rose-500 to-pink-600',
    desc: 'Submit requests for missing notes or books and track fulfillment status (Pending / Fulfilled).',
  },
  {
    title: 'Live Notice Board & Alerts',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    desc: 'Broadcast pinned diploma announcements regarding council exams, routine updates, and polytechnic news.',
  },
  {
    title: 'Comprehensive Admin Panel',
    icon: Workflow,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Full CRUD management suite for departments, subjects, resources, notices, requests, and developer team profiles.',
  },
  {
    title: 'Hybrid Serverless Store & Sync',
    icon: Database,
    color: 'from-teal-500 to-emerald-600',
    desc: 'MongoDB cloud database integrated with client-side localStorage fallback ensuring 100% demo uptime.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-8 sm:py-12 flex-1">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 border border-primary-200 text-xs sm:text-sm font-semibold text-primary-700 mb-4 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary-600 animate-spin-slow" />
            <span>Dip-Desk is running on Beta 0.7.3</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight"
          >
            About <span className="gradient-text">Dip-Desk</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 leading-relaxed"
          >
            Dip-Desk is built on modern web software and technologies. Check out the software versions, frameworks, and architecture powering the site below.
          </motion.p>
        </div>

        {/* Software & Technologies Used Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden border border-surface-200 mb-16 shadow-sm"
        >
          <div className="bg-gradient-to-r from-surface-50 via-white to-primary-50/40 px-6 py-4 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
                ⚙️
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-base sm:text-lg">Software & Technologies Used</h2>
                <p className="text-xs text-gray-500">Core software dependencies and framework version manifest</p>
              </div>
            </div>
            <span className="badge-primary text-xs hidden sm:inline-flex">Package Manifest</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50/80 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5">Technology / Software</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Purpose & Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {softwareTableData.map((item) => (
                  <tr key={item.name} className="hover:bg-surface-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-600 text-xs sm:text-sm">
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200/70">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${item.badgeClass}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs sm:text-sm">
                      {item.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Purpose & Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-50 via-white to-primary-50/40 p-6 sm:p-10 text-center shadow-sm mb-16 border border-surface-200/90"
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-50 border border-primary-200/80 text-xs font-semibold text-primary-700 mb-4 shadow-2xs">
              <Globe2 className="w-3.5 h-3.5 text-primary-600" /> Purpose & Vision
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-snug text-gray-900">
              Bridging the gap in organized polytechnic diploma education.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 max-w-2xl">
              Polytechnic diploma students often struggle to find syllabus-aligned notes, model question papers, and lab manuals organized by branch and semester. Dip-Desk solves this by providing a unified, high-performance digital library where study materials are structured, searchable, and instantly accessible without paywalls or intrusive ads.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Open Access</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Registration Required to Browse</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mobile & Tablet Optimized</span>
            </div>
          </div>
        </motion.div>

        {/* Platform Capabilities Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Key Platform Features</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Designed around student and admin workflows to make finding, saving, and managing notes effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="card p-5 border border-surface-200/80 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${cap.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1.5">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="card p-8 text-center bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 border border-primary-200/80 max-w-3xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Explore Diploma Study Materials Now</h3>
          <p className="text-sm text-gray-600 mb-6">Start browsing subject materials for your semester or check out the developer team.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/browse" className="btn-primary">
              <BookOpen className="w-4 h-4" /> Browse Resources
            </Link>
            <Link href="/developers" className="btn-secondary">
              <Code2 className="w-4 h-4" /> Meet Developers
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
