'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { syncAndFilterItems } from '@/lib/clientStore';

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
  const [counts, setCounts] = useState<{
    resources: number | null;
    subjects: number | null;
    students: number | null;
    visitors: number | null;
  }>({
    resources: null,
    subjects: null,
    students: null,
    visitors: null,
  });

  useEffect(() => {
    fetch(`/api/stats?track=1&t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setCounts({
          resources: typeof data.resources === 'number' ? data.resources : 0,
          subjects: typeof data.subjects === 'number' ? data.subjects : 0,
          students: typeof data.students === 'number' ? data.students : 0,
          visitors: typeof data.visitors === 'number' ? data.visitors : 0,
        });
      })
      .catch(() => {
        setCounts({
          resources: 0,
          subjects: 0,
          students: 0,
          visitors: 0,
        });
      });
  }, []);

  const stats = [
    {
      label: 'Resources',
      target: counts.resources ?? 0,
      suffix: '+',
      ready: counts.resources !== null,
    },
    {
      label: 'Subjects',
      target: counts.subjects ?? 0,
      suffix: '+',
      ready: counts.subjects !== null,
    },
    {
      label: 'Registered Students',
      target: counts.students ?? 0,
      suffix: '+',
      ready: counts.students !== null,
    },
    {
      label: 'Visitors',
      target: counts.visitors ?? 0,
      suffix: '+',
      ready: counts.visitors !== null,
    },
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
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-2"
          >
            <span className="gradient-text">Dip-Desk</span>
          </motion.h1>

          {/* Sub Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-4"
          >
            Built for students by Students
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Stop hunting through group chats. Search notes, preview files online, and organize your personal study library effortlessly.
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
            className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 mt-12 mb-6 flex-wrap"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center min-w-[70px]">
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
                <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5 whitespace-nowrap">
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
