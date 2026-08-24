import { Metadata } from 'next';
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
      <main className="w-full px-4 sm:px-8 lg:px-12 py-8 flex-1">
        <BranchPage branchSlug={branch} />
      </main>
    </>
  );
}
