'use client';
import { Lottie } from 'lottie-react';
import { browseLottieData } from '@/lib/browseLottieData';

export default function BrowseLottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[350px]">
      <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex items-center justify-center">
        <Lottie
          src={browseLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent tracking-wider uppercase mt-4 animate-pulse">
        Loading Departments & Courses...
      </p>
    </div>
  );
}
