'use client';
import { Lottie } from 'lottie-react';
import { subjectLottieData } from '@/lib/subjectLottieData';

export default function SubjectLottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[350px]">
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center bg-transparent [&_canvas]:!bg-transparent [&_svg]:overflow-visible">
        <Lottie
          src={subjectLottieData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent tracking-wider uppercase mt-4 animate-pulse">
        Loading Subjects...
      </p>
    </div>
  );
}
