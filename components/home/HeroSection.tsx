'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

/* ─── Animated Count-Up Number ─────────────────────────────────────── */
function CountUp({
  target,
  suffix = '',
  duration = 1.8,
  delay = 0,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', setDisplay);
    return unsub;
  }, [rounded]);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(motionVal, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1], // expo-out — fast start, snappy finish
    });
    return ctrl.stop;
  }, [inView, target, duration, delay, motionVal]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── Hero Section ──────────────────────────────────────────────────── */
export default function HeroSection() {
  const [branchCount, setBranchCount] = useState<number | null>(null);

  // Fetch real branch count from API
  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        const count = data.departments?.length ?? 0;
        setBranchCount(count);
      })
      .catch(() => setBranchCount(null));
  }, []);

  const stats = [
    {
      label: 'Branches',
      target: branchCount ?? 0,
      suffix: '',
      ready: branchCount !== null,
    },
    { label: 'Semesters',      target: 6,   suffix: '',   ready: true },
    { label: 'Resource Types', target: 4,   suffix: '',   ready: true },
    { label: 'Always Free',    target: 100, suffix: '%',  ready: true },
  ];

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
            Access notes, books, model question papers, and lab manuals for every
            branch and semester — organized, searchable, and always available.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/browse"
              className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto shadow-lg shadow-primary-500/20"
            >
              Browse Resources
            </Link>
          </motion.div>

          {/* Stats — count-up animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex items-center justify-center gap-8 md:gap-12 mt-12 mb-6 flex-wrap"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center min-w-[64px]">
                <p className="text-2xl sm:text-3xl font-extrabold gradient-text tabular-nums">
                  {stat.ready ? (
                    <CountUp
                      target={stat.target}
                      suffix={stat.suffix}
                      duration={1.6}
                      delay={0.55 + i * 0.12}
                    />
                  ) : (
                    /* While API is loading, show animated dots */
                    <span className="text-gray-300 text-xl animate-pulse">—</span>
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
