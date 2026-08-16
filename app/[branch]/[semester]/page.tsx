import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import SemesterPage from '@/components/pages/SemesterPage';

interface Props {
  params: Promise<{ branch: string; semester: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch = '', semester = 'semester-1' } = (await params) || {};
  const semNum = semester.replace('semester-', '');
  const branchUpper = branch.toUpperCase();
  return {
    title: `${branchUpper} — Semester ${semNum} | Dip-Desk`,
    description: `Browse all subjects for ${branchUpper} Semester ${semNum}.`,
  };
}

export default async function SemesterRoute({ params }: Props) {
  const { branch = '', semester = 'semester-1' } = (await params) || {};
  const semesterNumber = parseInt(semester.replace('semester-', '')) || 1;
  return (
    <>
      <Navbar />
      <main className="w-full px-4 sm:px-8 lg:px-12 py-8 flex-1">
        <SemesterPage branchSlug={branch} semesterNumber={semesterNumber} />
      </main>
    </>
  );
}
