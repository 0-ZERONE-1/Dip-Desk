import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Dip-Desk — Free Study Materials for Diploma Students',
  description:
    'Access free notes, books, model question papers and lab manuals for every Diploma branch and semester. Sign in with Google to save your favorites.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 container-max px-4">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
