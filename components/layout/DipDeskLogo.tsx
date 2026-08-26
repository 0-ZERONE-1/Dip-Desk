'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getRawImageUrl } from '@/lib/utils';
import { getCachedCustomLogo, setCachedCustomLogo } from '@/lib/logoCache';

export default function DipDeskLogo({ className = 'h-8', showText = true }: { className?: string; showText?: boolean }) {
  const [customLogo, setCustomLogo] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cached = getCachedCustomLogo();
    if (cached) {
      setCustomLogo(cached);
    }
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.customLogoUrl) {
          setCustomLogo(data.customLogoUrl);
          setCachedCustomLogo(data.customLogoUrl);
        }
      })
      .catch(() => { });
  }, []);

  const rawLogoUrl = getRawImageUrl(customLogo);

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-pointer select-none" suppressHydrationWarning>
      {/* ZERONE - Render custom branding logo image or simple book icon fallback */}
      <div className="relative flex items-center justify-center" suppressHydrationWarning>
        {mounted && rawLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rawLogoUrl}
            alt="Dip-Desk Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <img
            src="/logo.svg"
            alt="Dip-Desk Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* ZERONE - Dip-Desk header typography */}
      {showText && (
        <div className="hidden sm:flex items-center text-lg font-black tracking-tight leading-none">
          <span className="text-gray-900 group-hover:text-primary-600 transition-colors">Dip-</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600">Desk</span>
        </div>
      )}
    </div>
  );
}
