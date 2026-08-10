import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';

export const metadata: Metadata = {
  title: 'Dip-Desk — Free Study Materials for Diploma Students',
  description:
    'Access free notes, books, model question papers and lab manuals for every Diploma branch and semester.',
};

export default function HomePage() {
  return (
    <div className="hero-gradient min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient gradient glow blobs that extend full page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-accent-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[700px] h-[700px] bg-orange-200/25 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  );
}
