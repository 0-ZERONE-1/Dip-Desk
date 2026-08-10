'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, Globe, Code2, Loader2 } from 'lucide-react';

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
}

/* Deterministic shard origins per card index — each card explodes in from a unique direction */
const shardOrigins = [
  { x: -180, y: -120, rotate: -38, scale: 0.22 },
  { x: 170,  y: -100, rotate: 32,  scale: 0.18 },
  { x: -150, y: 110,  rotate: 45,  scale: 0.28 },
  { x: 130,  y: 140,  rotate: -25, scale: 0.22 },
  { x: 200,  y: -55,  rotate: -52, scale: 0.18 },
  { x: -200, y: 65,   rotate: 40,  scale: 0.28 },
];

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/developers')
      .then((r) => r.json())
      .then((data) => {
        setDevelopers(data.developers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-10 flex-1">
        {/* Header Hero */}
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
            Dip-Desk is engineered and maintained by passionate developers committed to providing students with high-quality, free educational resources.
          </motion.p>
        </div>

        {/* Developers Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : developers.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Developers Listed Yet</h3>
            <p className="text-sm text-gray-400">Admin can add developer profiles from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {developers.map((dev, i) => {
              const origin = shardOrigins[i % shardOrigins.length];
              return (
                <motion.div
                  key={dev._id}
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
                    delay: i * 0.18,
                    duration: 0.8,
                    type: 'spring',
                    stiffness: 110,
                    damping: 13,
                    opacity: { duration: 0.35, delay: i * 0.18 },
                    filter: { duration: 0.55, delay: i * 0.18, ease: 'easeOut' },
                  }}
                  className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-surface-200 overflow-hidden flex flex-col transition-shadow duration-300 max-w-sm mx-auto w-full h-full relative"
                >
                  {/* Shimmer sweep — runs once after the card snaps into place */}
                  <motion.div
                    initial={{ x: '-110%', opacity: 0.8 }}
                    animate={{ x: '210%', opacity: 0 }}
                    transition={{
                      delay: i * 0.18 + 0.75,
                      duration: 0.55,
                      ease: 'easeOut',
                    }}
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
                    }}
                  />

                  {/* Top Image — 1:1 Aspect Ratio */}
                  <div className="w-full aspect-square relative overflow-hidden bg-surface-100">
                    {dev.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dev.imageUrl}
                        alt={dev.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-5xl font-black">
                        {dev.name?.[0]?.toUpperCase() || 'D'}
                      </div>
                    )}
                  </div>

                  {/* Bottom Information Panel */}
                  <div className="px-5 pt-5 pb-2.5 flex flex-col text-center items-center flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{dev.name}</h3>
                    <span className="badge-primary mb-3 text-xs px-2.5 py-0.5">{dev.role}</span>

                    {dev.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{dev.bio}</p>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-3.5 pt-2 border-t border-surface-100 w-full justify-center mt-auto flex-wrap">
                      {dev.githubUrl && (
                        <a
                          href={dev.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-surface-100 transition-all"
                          title="GitHub Profile"
                        >
                          <Github className="w-7 h-7" />
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
                          <Linkedin className="w-7 h-7" />
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
                          <Instagram className="w-7 h-7" />
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
                          <Mail className="w-7 h-7" />
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
                          <Globe className="w-7 h-7" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
