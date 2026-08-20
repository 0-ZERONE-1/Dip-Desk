'use client';
import { Lottie } from 'lottie-react';
import { developerLottieData } from '@/lib/developerLottieData';

export default function DeveloperLottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
        <Lottie
          src={developerLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-500 tracking-wider uppercase mt-4 animate-pulse">
        Loading Developer Profiles...
      </p>
    </div>
  );
}
