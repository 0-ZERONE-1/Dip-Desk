'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRawImageUrl } from '@/lib/utils';
import { getCachedCustomLogo, setCachedCustomLogo } from '@/lib/logoCache';

const AboutLottieLoader = dynamic(
  () => import('@/components/AboutLottieLoader'),
  { ssr: false }
);

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
  ShieldAlert,
  Target,
  Rocket,
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
    desc: 'Embedded PDF previewer and direct external link access without mandatory downloads or taking up device storage.',
  },
  {
    title: 'Personal Bookmarks & Library',
    icon: Bookmark,
    color: 'from-amber-500 to-orange-600',
    desc: 'Save critical exam notes and question papers to your personalized student dashboard for quick 1-click revision.',
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
    title: 'Comprehensive Admin Suite',
    icon: Workflow,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Full management suite for departments, subjects, resources, notices, requests, users, and developer team profiles.',
  },
  {
    title: 'Hybrid Store & Demo Sync',
    icon: Database,
    color: 'from-teal-500 to-emerald-600',
    desc: 'MongoDB cloud database integrated with client-side localStorage fallback ensuring 100% demo uptime.',
  },
];

const howToGuideSteps = [
  {
    step: '01',
    title: 'Student & Admin Access',
    icon: KeyRound,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    summary: 'How to sign in and navigate directly to your panel.',
    details: [
      { label: 'Login Credentials', text: 'Valid Email Address and Password.' },
      { label: 'Direct Panel Transfer', text: 'Clicking your account avatar circle in the top-right corner transfers you directly to your Student Panel (or Admin Panel if you are an administrator).' },
      { label: 'Profile Customization', text: 'Customize your Full Name, Polytechnic Institute Name, Roll / Registration Number, and Designation anytime.' },
    ],
  },
  {
    step: '02',
    title: 'Finding & Previewing Study Resources',
    icon: Compass,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summary: 'Locate notes, books, and model papers in seconds.',
    details: [
      { label: 'Global Search Bar', text: 'Click the top Search Bar or press "Ctrl + K" (on desktop). Type any subject name, topic title, or resource keyword to see live suggestions.' },
      { label: 'Instant Document Previewer', text: 'Preview PDFs, question papers, and study guides directly in your browser without taking up device storage.' },
      { label: 'Category Filtering', text: 'Inside any subject page, switch between "Notes", "Books", "Model Question Papers", and "Lab Manuals" tabs.' },
    ],
  },
  {
    step: '03',
    title: 'Navigating Branches & Layouts',
    icon: FolderTree,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Browse subject curriculums step-by-step.',
    details: [
      { label: 'Step 1: Choose Branch', text: 'Click "Browse" in the top Navbar and choose your Engineering Branch (e.g., Computer Science, Mechanical, Electrical, ETCE).' },
      { label: 'Step 2: Choose Semester', text: 'Select your current academic semester (Semester 1 through Semester 6).' },
      { label: 'Step 3: Responsive Layouts', text: 'Subject & Notice pages span full width and auto-resize cleanly when zooming out or resizing your browser window.' },
    ],
  },
  {
    step: '04',
    title: 'Bookmarks, Requests & Custom Branding',
    icon: BookmarkCheck,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    summary: 'Save resources for revision or update site branding.',
    details: [
      { label: 'Saving Bookmarks', text: 'Click the Bookmark icon on any resource card to save it into your personal library for 1-click exam season access.' },
      { label: 'Requesting Materials', text: 'Can\'t find notes for a specific subject? Submit a request from your Student Panel, and administrators will upload it for you.' },
      { label: 'Site Logo & Branding Control', text: 'Administrators can set a custom SVG logo URL or reset to default simple book icon anytime from Admin Controls.' },
    ],
  },
];
function AboutLogoWatermark() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cached = getCachedCustomLogo();
    if (cached) setLogoUrl(cached);

    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.customLogoUrl) {
          setLogoUrl(data.customLogoUrl);
          setCachedCustomLogo(data.customLogoUrl);
        }
      })
      .catch(() => {});
  }, []);

  const rawUrl = logoUrl ? getRawImageUrl(logoUrl) : null;

  if (!mounted) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={rawUrl || '/logo.svg'}
      alt="Dip-Desk Logo"
      className="w-full h-full object-contain filter drop-shadow-xl"
    />
  );
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AboutLottieLoader visible={loading} />
      <main className="container-max px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full max-w-full overflow-x-hidden relative">
        {/* ZERONE - Fixed position background logo watermark */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[950px] lg:w-[1150px] h-[750px] sm:h-[950px] lg:h-[1150px] opacity-[0.06] sm:opacity-[0.1] pointer-events-none select-none z-0 flex items-center justify-center blur-[1px]">
          <AboutLogoWatermark />
        </div>

        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 pt-2 sm:pt-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 border border-primary-200 text-xs sm:text-sm font-semibold text-primary-700 mb-4 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
            <span>Dip-Desk is running on v1.0.3</span>
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
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group bg-white rounded-3xl border border-surface-200/90 hover:border-primary-300 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 mb-14 sm:mb-20 w-full relative overflow-hidden"
        >
          {/* Top Accent Gradient Bar on Hover */}
          <div className="absolute top-0 inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10" />

          <div className="bg-gradient-to-r from-surface-50 via-white to-primary-50/40 px-5 sm:px-8 py-5 sm:py-6 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-base sm:text-xl group-hover:text-primary-600 transition-colors leading-snug">
                  Software & Technologies Used
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block mt-0.5">Core software dependencies and framework version manifest</p>
              </div>
            </div>
            <span className="badge-primary text-xs font-bold flex-shrink-0 px-3.5 py-1 rounded-full shadow-2xs">
              Package Manifest
            </span>
          </div>

          {/* Mobile Card List Layout (Visible on Small Screens) */}
          <div className="sm:hidden divide-y divide-surface-100">
            {softwareTableData.map((item) => (
              <div key={item.name} className="p-4 space-y-2 hover:bg-primary-50/30 transition-colors">
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
                  <tr key={item.name} className="hover:bg-primary-50/40 transition-colors group/row">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2.5 group-hover/row:text-primary-600 transition-colors">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} group-hover/row:scale-125 transition-transform`} />
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-600 text-xs sm:text-sm whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200/70 shadow-2xs">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shadow-2xs ${item.badgeClass}`}>
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
          initial={{ opacity: 0, y: 35, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-50 via-white to-primary-50/50 p-6 sm:p-10 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 mb-12 sm:mb-16 border border-surface-200/90 w-full"
        >
          {/* Top Accent Gradient Bar on Hover */}
          <div className="absolute top-0 inset-x-10 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10" />

          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-surface-200/90">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-xs font-extrabold text-primary-800 shadow-2xs">
                <Globe2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span>Purpose & Core Vision</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">
                Empowering Polytechnic Diploma Engineering Students Nationwide
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Open Access
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Zero Subscription Fees
              </span>
            </div>
          </div>

          {/* 3 Pillar Grid of Deep Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 rounded-2xl bg-white border border-surface-200/90 hover:border-rose-300 shadow-xs hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between group/pillar relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 rounded-full opacity-0 group-hover/pillar:opacity-100 transition-opacity" />
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white flex items-center justify-center mb-3.5 shadow-md group-hover/pillar:scale-110 group-hover/pillar:shadow-lg transition-all duration-300 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover/pillar:text-rose-600 transition-colors mb-2">The Problem We Solved</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Polytechnic diploma students across various institutes frequently struggle to locate reliable, syllabus-aligned study materials. Notes are often scattered across random messaging groups, broken Google Drive links, or paywalled platforms filled with aggressive popup advertisements.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 rounded-2xl bg-white border border-surface-200/90 hover:border-primary-300 shadow-xs hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 flex flex-col justify-between group/pillar relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-primary-500/0 via-primary-500 to-primary-500/0 rounded-full opacity-0 group-hover/pillar:opacity-100 transition-opacity" />
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-center mb-3.5 shadow-md group-hover/pillar:scale-110 group-hover/pillar:shadow-lg transition-all duration-300 flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover/pillar:text-primary-600 transition-colors mb-2">Our Mission & Goal</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Dip-Desk was built to centralize polytechnic education into a fast, unified digital hub. We organize all diploma curriculum resources — handwritten lecture notes, official council model question papers, standard textbooks, and lab solution manuals — categorized cleanly by engineering branch and semester.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 rounded-2xl bg-white border border-surface-200/90 hover:border-emerald-300 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between group/pillar relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 rounded-full opacity-0 group-hover/pillar:opacity-100 transition-opacity" />
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-3.5 shadow-md group-hover/pillar:scale-110 group-hover/pillar:shadow-lg transition-all duration-300 flex-shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover/pillar:text-emerald-600 transition-colors mb-2">Student-Centric Vision</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We believe high-quality study resources must be open and accessible to every student, regardless of financial background. Dip-Desk offers sub-second instant search, in-browser PDF previewers, personal bookmarks, and zero mandatory downloads or registration barriers for browsing.
                </p>
              </div>
            </motion.div>
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
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: 0.08 * i, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 p-5 sm:p-6 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top Accent Gradient Bar on Hover */}
                <div className="absolute top-0 inset-x-6 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                <div>
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-r ${cap.color} text-white flex items-center justify-center mb-3.5 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 flex-shrink-0`}>
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5 leading-snug">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Guide & How-To Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-50 border border-accent-200 text-xs font-semibold text-accent-700 mb-3 shadow-2xs">
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
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: 0.1 * idx, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-surface-200/90 hover:border-primary-300 p-6 sm:p-7 shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top Accent Gradient Bar on Hover */}
                <div className="absolute top-0 inset-x-8 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                        {item.step}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed font-medium">{item.summary}</p>

                  <div className="space-y-3">
                    {item.details.map((detail) => (
                      <div key={detail.label} className="p-3.5 rounded-2xl bg-surface-50/80 border border-surface-100/90 hover:bg-primary-50/40 hover:border-primary-200/60 transition-colors">
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
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 border border-primary-200/90 hover:border-primary-400 rounded-3xl p-6 sm:p-10 text-center shadow-card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden max-w-3xl mx-auto"
        >
          <div className="absolute top-0 inset-x-12 h-[3px] bg-gradient-to-r from-primary-500/0 via-primary-500 via-accent-500 to-accent-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            Explore Diploma Study Materials Now
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
            Start browsing subject materials for your semester or check out the developer team.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/browse" className="btn-primary hover:scale-105 transition-all shadow-md">
              <BookOpen className="w-4 h-4" /> Browse Resources
            </Link>
            <Link href="/developers" className="btn-secondary hover:scale-105 transition-all">
              <Code2 className="w-4 h-4" /> Meet Developers
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}
