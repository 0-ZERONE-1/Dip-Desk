import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import SubjectPage from '@/components/pages/SubjectPage';

interface Props {
  params: Promise<{ branch: string; semester: string; subject: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { semester = 'semester-1', subject = '' } = (await params) || {};
  const semNum = semester.replace('semester-', '');
  const subjectName = subject.replace(/-/g, ' ');
  return {
    title: `${subjectName} — Semester ${semNum} | Dip-Desk`,
    description: `Notes, books, model question papers and lab manuals for ${subjectName}.`,
  };
}

export default async function SubjectRoute({ params }: Props) {
  const { branch = '', semester = 'semester-1', subject = '' } = (await params) || {};
  const semesterNumber = parseInt(semester.replace('semester-', '')) || 1;
  return (
    <>
      <Navbar />
      <main className="w-full px-4 sm:px-8 lg:px-12 py-8 flex-1">
        <SubjectPage
          branchSlug={branch}
          semesterNumber={semesterNumber}
          subjectSlug={subject}
        />
      </main>
    </>
  );
}
