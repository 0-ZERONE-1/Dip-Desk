'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative px-4 py-20 md:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">


          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 text-balance"
          >
            Your Complete{' '}
            <span className="gradient-text">Study Library</span>
            <br />for Diploma Students
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Access notes, books, model question papers, and lab manuals for every branch and semester — organized, searchable, and always available.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/browse" className="btn-primary px-8 py-3 text-base w-full sm:w-auto">
              Browse Resources
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 text-base w-full sm:w-auto">
              Sign In with Google
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-16 flex-wrap"
          >
            {[
              { label: 'Branches', value: '3+' },
              { label: 'Semesters', value: '6' },
              { label: 'Resource Types', value: '4' },
              { label: 'Always Free', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
