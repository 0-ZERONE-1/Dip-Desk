import Navbar from '@/components/layout/Navbar';
import AdminNav from '@/components/admin/AdminNav';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50/70 flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1 flex flex-col">
        <div className="w-full max-w-[1700px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 flex flex-col md:flex-row gap-5 lg:gap-7">
          <AdminNav />
          <main className="flex-1 min-w-0">
            <AdminPageWrapper>{children}</AdminPageWrapper>
          </main>
        </div>
      </div>
    </div>
  );
}
