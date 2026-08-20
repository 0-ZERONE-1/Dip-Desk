'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  animate,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, Globe, Code2, Loader2 } from 'lucide-react';
import { syncAndFilterItems } from '@/lib/clientStore';
import { formatImageUrl } from '@/lib/utils';

interface DeveloperItem {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  emailUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  order?: number;
}

import DeveloperLottieLoader from '@/components/DeveloperLottieLoader';

/* Shard origins for the entry animation */
const shardOrigins = [
  { x: -180, y: -120, rotate: -38, scale: 0.22 },
  { x: 170,  y: -100, rotate: 32,  scale: 0.18 },
  { x: -150, y: 110,  rotate: 45,  scale: 0.28 },
  { x: 130,  y: 140,  rotate: -25, scale: 0.22 },
  { x: 200,  y: -55,  rotate: -52, scale: 0.18 },
  { x: -200, y: 65,   rotate: 40,  scale: 0.28 },
];

/* ─── Animated RGB Gradient Border Wrapper ────────────────────────── */
function AIGradientBorder({
  children,
  className = '',
  duration = 4,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const turn = useMotionValue(0);

  useEffect(() => {
    const controls = animate(turn, 1, {
      ease: 'linear',
      duration,
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [duration, turn]);

  /* Conic gradient that continuously rotates around the card border */
  const gradient = useMotionTemplate`conic-gradient(from ${turn}turn, transparent 0%, #ec489900 5%, #ec4899 12%, #a855f7 20%, #6366f1 28%, #3b82f6 36%, #14b8a6 44%, #f59e0b 48%, #f59e0b00 54%, transparent 58%)`;

  return (
    <div className={`relative p-[2px] rounded-[1.25rem] h-full flex flex-col ${className}`}>
      {/* Animated Conic Gradient Border */}
      <motion.div
        style={{ backgroundImage: gradient }}
        className="absolute inset-0 rounded-[inherit]"
      />

      {/* Card Content + Glow Spill */}
      <div className="relative rounded-[calc(1.25rem-2px)] overflow-hidden h-full flex flex-col flex-1 bg-white">
        <div className="relative h-full flex flex-col flex-1 z-0">{children}</div>

        {/* Ambient Outer Glow Spill */}
        <motion.div
          style={{ backgroundImage: gradient }}
          className="ai-glow-spill-mask opacity-60 blur-xl pointer-events-none absolute inset-[-30%] z-10 overflow-hidden"
        />
      </div>
    </div>
  );
}

/* ─── 3D Tilt Card Component ───────────────────────────────────────── */
function TiltCard({
  dev,
  index,
}: {
  dev: DeveloperItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const origin = shardOrigins[index % shardOrigins.length];

  /* Raw mouse-derived tilt values */
  const rawX = useMotionValue(0);   // rotateX (up/down)
  const rawY = useMotionValue(0);   // rotateY (left/right)
  const rawGlowX = useMotionValue(50);
  const rawGlowY = useMotionValue(50);

  /* Spring-smoothed versions for butter-smooth tilt */
  const springConfig = { stiffness: 200, damping: 22, mass: 0.6 };
  const rotateX = useSpring(rawX, springConfig);
  const rotateY = useSpring(rawY, springConfig);
  const glowX   = useSpring(rawGlowX, { stiffness: 150, damping: 20 });
  const glowY   = useSpring(rawGlowY, { stiffness: 150, damping: 20 });

  /* Mouse spotlight gradient inside card */
  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 35%, transparent 70%)`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);   // −1 … +1
      const dy = (e.clientY - cy) / (rect.height / 2);  // −1 … +1

      rawY.set(dx * 14);    // tilt left/right up to 14°
      rawX.set(-dy * 10);   // tilt up/down up to 10°
      rawGlowX.set(((e.clientX - rect.left) / rect.width) * 100);
      rawGlowY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [rawX, rawY, rawGlowX, rawGlowY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rawGlowX.set(50);
    rawGlowY.set(50);
  }, [rawX, rawY, rawGlowX, rawGlowY]);

  return (
    /* Entry Shatter Animation Wrapper */
    <motion.div
      initial={{
        opacity: 0,
        x: origin.x,
        y: origin.y,
        rotate: origin.rotate,
        scale: origin.scale,
        filter: 'blur(14px)',
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      transition={{
        delay: index * 0.18,
        duration: 0.8,
        type: 'spring',
        stiffness: 110,
        damping: 13,
        opacity: { duration: 0.35, delay: index * 0.18 },
        filter: { duration: 0.55, delay: index * 0.18, ease: 'easeOut' },
      }}
      style={{ perspective: 900 }}
      className="max-w-sm mx-auto w-full h-full flex flex-col"
    >
      {/* 3D Tilt Wrapper */}
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full flex flex-col flex-1 cursor-default"
      >
        {/* Animated RGB Gradient Border Card */}
        <AIGradientBorder className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
          {/* Shimmer sweep after assembly */}
          <motion.div
            initial={{ x: '-110%', opacity: 0.8 }}
            animate={{ x: '210%', opacity: 0 }}
            transition={{
              delay: index * 0.18 + 0.75,
              duration: 0.55,
              ease: 'easeOut',
            }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.65) 50%, transparent 75%)',
            }}
          />

          {/* Mouse Spotlight Overlay */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: glowBackground }}
          />

          {/* Photo Header */}
          <div className="w-full aspect-square relative overflow-hidden bg-surface-100 flex-shrink-0">
            {dev.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formatImageUrl(dev.imageUrl)}
                alt={dev.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-5xl font-black">
                {dev.name?.[0]?.toUpperCase() || 'D'}
              </div>
            )}
          </div>

          {/* Info Panel - min-h and flex layout so all cards maintain identical uniform height */}
          <div className="px-6 pt-5 pb-4 flex flex-col text-center items-center flex-1 relative z-10 bg-white w-full min-w-0 box-border min-h-[195px] justify-between">
            <div className="w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight max-w-full truncate">{dev.name}</h3>
              <span className="badge-primary mb-3 text-xs px-2.5 py-0.5">{dev.role}</span>

              {dev.bio ? (
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4 break-words [overflow-wrap:anywhere] max-w-full w-full">
                  {dev.bio}
                </p>
              ) : (
                <div className="w-full flex items-center justify-center my-auto min-h-[52px]">
                  <p className="text-xs text-gray-400 italic">Platform Developer & Contributor</p>
                </div>
              )}
            </div>

            {/* Social Links Pinned to Bottom */}
            <div className="flex items-center gap-3.5 pt-3 border-t border-surface-100 w-full justify-center mt-auto min-h-[46px] flex-wrap">
              {dev.githubUrl || dev.linkedinUrl || dev.instagramUrl || dev.emailUrl || dev.portfolioUrl ? (
                <>
                  {dev.githubUrl && (
                    <a
                      href={dev.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-surface-100 transition-all"
                      title="GitHub Profile"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  )}
                  {dev.linkedinUrl && (
                    <a
                      href={dev.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {dev.instagramUrl && (
                    <a
                      href={dev.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xl text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                      title="Instagram Profile"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {dev.emailUrl && (
                    <a
                      href={
                        dev.emailUrl.startsWith('mailto:')
                          ? dev.emailUrl
                          : `mailto:${dev.emailUrl}`
                      }
                      className="p-1 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                      title="Send Email"
                    >
                      <Mail className="w-6 h-6" />
                    </a>
                  )}
                  {dev.portfolioUrl && (
                    <a
                      href={dev.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                      title="Portfolio Website"
                    >
                      <Globe className="w-6 h-6" />
                    </a>
                  )}
                </>
              ) : (
                <span className="text-xs font-semibold text-gray-300 tracking-wider uppercase py-1">
                  Dip-Desk Core
                </span>
              )}
            </div>
          </div>
        </AIGradientBorder>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Developers Page ─────────────────────────────────────────── */
export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/developers?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const rawDevs = syncAndFilterItems<DeveloperItem>('developers', data.developers || []);
        const sortedDevs = [...rawDevs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        setDevelopers(sortedDevs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-10 flex-1">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3"
          >
            Meet Our <span className="gradient-text">Developers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto"
          >
            Dip-Desk is engineered and maintained by passionate developers committed to
            providing students with high-quality, free educational resources.
          </motion.p>
        </div>

        {loading ? (
          <DeveloperLottieLoader />
        ) : developers.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Developers Listed Yet</h3>
            <p className="text-sm text-gray-400">Admin can add developer profiles from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {developers.map((dev, i) => (
              <TiltCard key={dev._id} dev={dev} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
