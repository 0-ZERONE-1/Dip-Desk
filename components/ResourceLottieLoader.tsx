'use client';
import { Lottie } from 'lottie-react';
import { resourceLottieData } from '@/lib/resourceLottieData';

export default function ResourceLottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[350px]">
      <div className="w-64 sm:w-80 h-32 sm:h-40 relative flex items-center justify-center">
        <Lottie
          src={resourceLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent tracking-wider uppercase mt-4 animate-pulse">
        Loading Resources & Study Materials...
      </p>
    </div>
  );
}
