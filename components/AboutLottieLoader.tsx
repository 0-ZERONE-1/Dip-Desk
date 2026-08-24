'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { getRawImageUrl } from '@/lib/utils';
import { getCachedCustomLogo, setCachedCustomLogo } from '@/lib/logoCache';

interface Props {
  visible: boolean;
}

export default function AboutLottieLoader({ visible }: Props) {
  const [mounted, setMounted] = useState(false);
  // Pre-load from memory & localStorage immediately so there is 0ms delay / no flash
  const [customLogo, setCustomLogo] = useState<string>(() => getCachedCustomLogo());
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        const logo = data.customLogoUrl || '';
        setCustomLogo(logo);
        setCachedCustomLogo(logo);
        setFetched(true);
      })
      .catch(() => {
        setFetched(true);
      });
  }, []);

  if (!mounted) return null;

  const rawLogoUrl = getRawImageUrl(customLogo);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="about-logo-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
          style={{ zIndex: 30 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-white overflow-hidden select-none pointer-events-auto"
        >
          {/* Ambient colorful glowing background aura */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.65, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-[100vw] h-[100vw] max-w-[1500px] max-h-[1500px] bg-gradient-to-tr from-blue-500/35 via-indigo-500/30 to-purple-600/40 rounded-full blur-3xl"
            />
          </div>

          {/* Giant Website Logo Container with breathing animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: [0.96, 1.03, 0.96],
              opacity: 1,
            }}
            transition={{
              scale: {
                duration: 2.6,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: { duration: 0.25 },
            }}
            className="relative w-[85vw] sm:w-[90vw] md:w-[92vw] h-[60vh] sm:h-[75vh] md:h-[85vh] max-w-[1200px] max-h-[800px] px-4 sm:px-6 flex items-center justify-center z-10"
          >
            {rawLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rawLogoUrl}
                alt="Website Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
              />
            ) : fetched ? (
              <div className="w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <BookOpen className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 text-white stroke-[1.5]" />
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
