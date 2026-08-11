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
  HelpCircle,
  KeyRound,
  Compass,
  FolderTree,
  BookmarkCheck,
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

const howToGuideSteps = [
  {
    step: '01',
    title: 'Student Account & Login Requirements',
    icon: KeyRound,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    summary: 'How to sign in and what information is needed to get started.',
    details: [
      { label: 'Login Requirements', text: 'Valid Email Address and Password.' },
      { label: 'Profile Options', text: 'Full Name, Polytechnic Institute Name, Roll / Registration Number, and Designation.' },
      { label: 'How to Sign In', text: 'Click the "Sign In" or "Register" button in the top right corner of the Navbar. Once authenticated, click your avatar to access the "Student Panel".' },
    ],
  },
  {
    step: '02',
    title: 'How to Find Specific Study Resources',
    icon: Compass,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summary: 'Locate notes, books, and model papers in seconds.',
    details: [
      { label: 'Global Search Bar', text: 'Click the top Search Bar or press "Ctrl + K" (on desktop). Type any subject name, topic title, or resource keyword to see live suggestions.' },
      { label: 'Inline Previewing', text: 'Click "Open" or the Eye icon on any card to read PDFs directly in your browser without forcing downloads.' },
      { label: 'Category Filtering', text: 'Inside any subject page, switch between "Notes", "Books", "Model Question Papers", and "Lab Manuals" tabs.' },
    ],
  },
  {
    step: '03',
    title: 'Navigating Departments & Semesters',
    icon: FolderTree,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Browse subject curriculums step-by-step.',
    details: [
      { label: 'Step 1: Department', text: 'Click "Browse" in the top Navbar and choose your Engineering Branch (e.g., Computer Science, Mechanical, Electrical, ETCE).' },
      { label: 'Step 2: Semester', text: 'Select your current academic semester (Semester 1 through Semester 6).' },
      { label: 'Step 3: Subject', text: 'Click on any subject card to view all verified study materials associated with that subject.' },
    ],
  },
  {
    step: '04',
    title: 'Bookmarking & Requesting Missing Materials',
    icon: BookmarkCheck,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    summary: 'Save resources for revision or request new notes.',
    details: [
      { label: 'Saving Bookmarks', text: 'Click the Bookmark icon on any resource card to save it. View all your saved notes anytime under your "Student Panel".' },
      { label: 'Requesting Materials', text: 'Can\'t find notes for a specific topic? Submit a resource request from your Student Panel, and site admins will upload it for you!' },
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container-max px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full max-w-full overflow-x-hidden">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 border border-primary-200 text-xs sm:text-sm font-semibold text-primary-700 mb-4 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary-600 animate-spin-slow flex-shrink-0" />
            <span>Dip-Desk is running on Beta 0.7.3</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
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
            className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Dip-Desk is built on modern web software and technologies. Check out the software versions, frameworks, features, and platform user guide below.
          </motion.p>
        </div>

        {/* Software & Technologies Used Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden border border-surface-200 mb-12 sm:mb-16 shadow-sm w-full"
        >
          <div className="bg-gradient-to-r from-surface-50 via-white to-primary-50/40 px-4 sm:px-6 py-4 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                ⚙️
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-sm sm:text-lg">Software & Technologies Used</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Core software dependencies and framework version manifest</p>
              </div>
            </div>
            <span className="badge-primary text-xs flex-shrink-0">Package Manifest</span>
          </div>

          {/* Mobile Card List Layout (Visible on Small Screens) */}
          <div className="sm:hidden divide-y divide-surface-100">
            {softwareTableData.map((item) => (
              <div key={item.name} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200/70 font-mono text-xs font-bold text-primary-600 flex-shrink-0">
                    {item.version}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-semibold border text-[11px] ${item.badgeClass}`}>
                    {item.category}
                  </span>
                  <span className="text-gray-500 text-right truncate max-w-[200px]">{item.purpose}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Visible on Medium+ Screens) */}
          <div className="hidden sm:block overflow-x-auto">
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
                    <td className="px-6 py-4 font-mono font-bold text-primary-600 text-xs sm:text-sm whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200/70">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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

        {/* Purpose & Vision Section — Full Width & Rich Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-50 via-white to-primary-50/50 p-6 sm:p-10 shadow-sm mb-12 sm:mb-16 border border-surface-200/90 w-full"
        >
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-surface-200">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-xs font-extrabold text-primary-800">
                <Globe2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span>Purpose & Core Vision</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
                Empowering Polytechnic Diploma Engineering Students Nationwide
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Open Access
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Zero Subscription Fees
              </span>
            </div>
          </div>

          {/* 3 Pillar Grid of Deep Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-lg mb-4">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">The Problem We Solved</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Polytechnic diploma students across various institutes frequently struggle to locate reliable, syllabus-aligned study materials. Notes are often scattered across random messaging groups, broken Google Drive links, or paywalled platforms filled with aggressive popup advertisements.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center font-bold text-lg mb-4">
                  🎯
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Our Mission & Goal</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Dip-Desk was built to centralize polytechnic education into a fast, unified digital hub. We organize all diploma curriculum resources — handwritten lecture notes, official council model question papers, standard textbooks, and lab solution manuals — categorized cleanly by engineering branch and semester.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                  🚀
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Student-Centric Vision</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We believe high-quality study resources must be open and accessible to every student, regardless of financial background. Dip-Desk offers sub-second instant search, in-browser PDF previewers, personal bookmarks, and zero mandatory downloads or registration barriers for browsing.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-base sm:text-lg">Ready to start your exam preparation?</h4>
              <p className="text-xs sm:text-sm text-primary-100">Explore handwritten notes, lab manuals, and previous year question papers for your semester.</p>
            </div>
            <Link href="/browse" className="btn-secondary bg-white text-primary-700 hover:bg-surface-100 text-xs sm:text-sm px-6 py-2.5 flex-shrink-0 font-bold">
              Browse All Branches →
            </Link>
          </div>
        </motion.div>

        {/* Platform Capabilities Grid */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Key Platform Features</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Designed around student and admin workflows to make finding, saving, and managing notes effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {platformCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="card p-5 border border-surface-200/80 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${cap.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">{cap.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Guide & How-To Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-50 border border-accent-200 text-xs font-semibold text-accent-700 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-accent-600 flex-shrink-0" /> Site User Guide
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">How to Use Dip-Desk</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Step-by-step instructions on signing in, finding resources, browsing branches, and bookmarking materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howToGuideSteps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="card p-6 sm:p-7 border border-surface-200/90 hover:border-primary-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed font-medium">{item.summary}</p>

                  <div className="space-y-3">
                    {item.details.map((detail) => (
                      <div key={detail.label} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                          {detail.label}
                        </div>
                        <p className="text-xs text-gray-600 pl-3.5 leading-relaxed">{detail.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="card p-6 sm:p-8 text-center bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 border border-primary-200/80 max-w-3xl mx-auto">
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
