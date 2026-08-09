import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BranchPage from '@/components/pages/BranchPage';

interface Props {
  params: Promise<{ branch: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch = '' } = (await params) || {};
  const branchUpper = branch ? branch.toUpperCase() : 'BRANCH';
  return {
    title: `${branchUpper} — Dip-Desk`,
    description: `Browse all semester resources for ${branchUpper} branch.`,
  };
}

export default async function BranchRoute({ params }: Props) {
  const { branch = '' } = (await params) || {};
  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-8 flex-1">
        <BranchPage branchSlug={branch} />
      </main>
      <Footer />
    </>
  );
}
