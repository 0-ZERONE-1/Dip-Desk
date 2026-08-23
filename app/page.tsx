import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import LatestNoticeSection from '@/components/home/LatestNoticeSection';

export const metadata: Metadata = {
  title: 'Dip-Desk — Free Study Materials for Diploma Students',
  description:
    'Access free notes, books, model question papers and lab manuals for every Diploma branch and semester.',
};

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Background soft blue-purple ambient gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[500px] bg-gradient-to-tr from-blue-400/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <HeroSection />
        <FeaturesSection />
        <LatestNoticeSection />
      </main>
    </div>
  );
}
