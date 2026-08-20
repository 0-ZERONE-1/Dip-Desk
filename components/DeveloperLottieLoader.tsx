'use client';
import { useLottie } from 'lottie-react';
import developerLoaderData from '@/public/developer-loader.json';

export default function DeveloperLottieLoader() {
  const options = {
    animationData: developerLoaderData,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
        {View}
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-500 tracking-wider uppercase mt-4 animate-pulse">
        Loading Developer Profiles...
      </p>
    </div>
  );
}
