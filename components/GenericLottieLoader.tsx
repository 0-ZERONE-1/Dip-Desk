'use client';
import { Lottie } from 'lottie-react';
import { universalLottieData } from '@/lib/universalLottieData';

interface Props {
  text?: string;
  className?: string;
}

export default function GenericLottieLoader({
  text = 'Loading...',
  className = 'py-16 min-h-[300px]',
}: Props) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="w-48 sm:w-64 h-24 sm:h-32 relative flex items-center justify-center overflow-hidden">
        <Lottie
          src={universalLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent tracking-wider uppercase mt-2 animate-pulse">
        {text}
      </p>
    </div>
  );
}
