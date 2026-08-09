'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative px-4 pt-12 pb-6 md:pt-20 md:pb-8">
      <div className="container-max relative">
        <div className="max-w-4xl mx-auto text-center">

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5 text-balance"
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
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
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
            <Link href="/browse" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto shadow-lg shadow-primary-500/20">
              Browse Resources
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-8 md:gap-12 mt-12 mb-6 flex-wrap"
          >
            {[
              { label: 'Branches', value: '3+' },
              { label: 'Semesters', value: '6' },
              { label: 'Resource Types', value: '4' },
              { label: 'Always Free', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
