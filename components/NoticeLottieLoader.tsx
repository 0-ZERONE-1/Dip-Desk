'use client';
import { Lottie } from 'lottie-react';
import { noticeLottieData } from '@/lib/noticeLottieData';

export default function NoticeLottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[350px]">
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
        <Lottie
          src={noticeLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent tracking-wider uppercase mt-4 animate-pulse">
        Loading Announcements & Notices...
      </p>
    </div>
  );
}
