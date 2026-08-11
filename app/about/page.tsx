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
  Server,
  FileCode2,
  Boxes,
  Lock,
  Search,
  Bookmark,
  ThumbsUp,
  FileText,
  Workflow,
  Heart,
} from 'lucide-react';

const techStack = [
  {
    category: 'Frontend Core',
    icon: Code2,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    headerGradient: 'from-blue-600 to-cyan-500',
    description: 'Built on the latest cutting-edge React ecosystem for lightning-fast rendering.',
    items: [
      { name: 'Next.js 16 (Turbopack)', desc: 'App Router architecture with React Server Components & hybrid SSR.' },
      { name: 'React 19', desc: 'Concurrent UI hydration, hooks, and seamless state synchronization.' },
      { name: 'TypeScript 5', desc: 'End-to-end strict static type safety across API routes & components.' },
    ],
  },
  {
    category: 'Styling & UI Aesthetics',
    icon: Layout,
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200',
    headerGradient: 'from-purple-600 to-pink-500',
    description: 'Curated modern glassmorphic design system with vibrant accent palettes.',
    items: [
      { name: 'Vanilla CSS Design System', desc: 'Custom HSL CSS tokens, glassmorphism backdrop blurs & clean utility classes.' },
      { name: 'Lucide Vector Icons', desc: 'Crisp, lightweight SVG icons tailored for accessible UI elements.' },
      { name: 'Framer Motion', desc: 'Fluid spring animations, layout transitions, and interactive entry effects.' },
    ],
  },
  {
    category: 'Data & Persistence Architecture',
    icon: Database,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    headerGradient: 'from-emerald-600 to-teal-500',
    description: 'Hybrid storage engine ensuring zero-downtime access to study materials.',
    items: [
      { name: 'MongoDB & Mongoose Schema', desc: 'Cloud database with relational schemas for branches, subjects, and resources.' },
      { name: 'LocalStorage Client Store Sync', desc: 'Zero-latency offline fallback store with real-time sync for demo sessions.' },
      { name: 'Zero-Cache Edge Headers', desc: 'Explicit cache invalidation headers guaranteeing real-time content updates.' },
    ],
  },
  {
    category: 'Security & Authentication',
    icon: ShieldCheck,
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    headerGradient: 'from-amber-600 to-orange-500',
    description: 'Enterprise-grade session management and role-based access controls.',
    items: [
      { name: 'NextAuth.js v4', desc: 'Secure OAuth & credentials authentication with encrypted JWT cookies.' },
      { name: 'Role-Based Access (RBAC)', desc: 'Granular permissions differentiating Student vs Administrator capabilities.' },
      { name: 'Bcrypt Password Hashing', desc: 'Salted cryptographic hashing protecting stored user credentials.' },
    ],
  },
];

const platformCapabilities = [
  {
    title: 'Instant Global Search',
    icon: Search,
    color: 'from-blue-500 to-indigo-600',
    desc: 'Sub-second real-time search auto-indexing titles, subjects, categories, and keywords.',
  },
  {
    title: 'Inline Document Previewer',
    icon: FileText,
    color: 'from-violet-500 to-purple-600',
    desc: 'Embedded high-speed PDF reader allowing students to view notes without downloading.',
  },
  {
    title: 'Personal Bookmarks & Library',
    icon: Bookmark,
    color: 'from-amber-500 to-orange-600',
    desc: 'Save critical exam preparation materials to your personalized student dashboard.',
  },
  {
    title: 'Community Quality Voting',
    icon: ThumbsUp,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Student upvotes and downvotes prioritize top-quality handwritten notes and papers.',
  },
  {
    title: 'Live Notice Board',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    desc: 'Real-time announcements regarding council exams, routine updates, and polytechnic news.',
  },
  {
    title: 'Comprehensive Admin Panel',
    icon: Workflow,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Full CRUD management suite for departments, subjects, resources, and developer profiles.',
  },
];

const systemSpecs = [
  { label: 'Platform Name', value: 'Dip-Desk (Diploma Resource Hub)' },
  { label: 'Platform Version', value: 'v1.0.0 (Production Build)' },
  { label: 'Target Audience', value: 'Polytechnic Diploma Students (WBSCT&VE)' },
  { label: 'Supported Branches', value: 'Mechanical, CST, EE, ETCE, Civil & more' },
  { label: 'Supported Semesters', value: 'Semester 1 through Semester 6' },
  { label: 'Resource Categories', value: 'Notes, Books, Question Papers, Lab Manuals' },
  { label: 'Hosting & Deployment', value: 'Vercel Global Edge Serverless Network' },
  { label: 'Open Source License', value: 'MIT License' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-8 sm:py-12 flex-1">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 border border-primary-200 text-xs sm:text-sm font-semibold text-primary-700 mb-4 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary-600 animate-spin-slow" />
            <span>Platform Overview & Specifications</span>
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
            Dip-Desk is a modern, open-access study platform built specifically for Diploma Engineering students.
            Explore the technology stack, system architecture, and core features powering this web app.
          </motion.p>
        </div>

        {/* Top Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 sm:mb-16">
          {[
            { label: 'Target Audience', val: '100% Diploma', icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
            { label: 'Semesters Covered', val: 'Sem 1 to Sem 6', icon: Layers, color: 'text-accent-600 bg-accent-50' },
            { label: 'Core Framework', val: 'Next.js 16', icon: Cpu, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Search Latency', val: '< 50ms Live', icon: Zap, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="card p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-md transition-all duration-200 border border-surface-200/80"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-inner`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-0.5">{stat.val}</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement Colored Text Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-surface-900 to-primary-950 p-6 sm:p-10 text-white shadow-xl mb-16 border border-white/10"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-300 mb-4 border border-white/10">
              <Globe2 className="w-3.5 h-3.5 text-accent-400" /> Purpose & Vision
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-snug text-white">
              Bridging the gap in organized polytechnic diploma education.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              Polytechnic diploma students often struggle to find syllabus-aligned notes, model question papers, and lab manuals organized by branch and semester. Dip-Desk solves this by providing a unified, lightning-fast digital library where study materials are structured, searchable, and instantly accessible without paywalls or intrusive ads.
            </p>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-gray-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Open Access</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Registration Required to Browse</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mobile & Tablet Optimized</span>
            </div>
          </div>
        </motion.div>

        {/* Technology Stack Grid Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Technologies & Architecture</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Dip-Desk is engineered with modern web standards for maximum speed, security, and developer ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="card p-6 sm:p-7 border border-surface-200/90 hover:border-primary-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${tech.headerGradient} text-white shadow-sm`}>
                        <tech.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{tech.category}</h3>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tech.badgeColor}`}>
                      Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">{tech.description}</p>

                  <div className="space-y-3">
                    {tech.items.map((item) => (
                      <div key={item.name} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 mb-0.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {item.name}
                        </div>
                        <p className="text-xs text-gray-500 pl-3.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform Capabilities Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Key Platform Features</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Designed around student workflows to make finding and saving notes effortless.
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

        {/* System Specifications Table Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden border border-surface-200 mb-16"
        >
          <div className="bg-gradient-to-r from-surface-50 to-primary-50/30 px-6 py-4 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900 text-base">Web Application Specifications</h3>
            </div>
            <span className="badge-primary text-xs">System Info</span>
          </div>
          <div className="divide-y divide-surface-100">
            {systemSpecs.map((spec) => (
              <div key={spec.label} className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-surface-50/60 transition-colors">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">{spec.label}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 font-mono bg-surface-100/80 px-2.5 py-1 rounded-lg">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

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
