import AdminNav from '@/components/admin/AdminNav';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50/70 flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-[1700px] mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-6 sm:py-7 flex-1 flex flex-col md:flex-row items-start gap-5 lg:gap-7 relative">
          <AdminNav />
          <main className="flex-1 min-w-0 w-full md:ml-70 lg:ml-80">
            <AdminPageWrapper>{children}</AdminPageWrapper>
          </main>
        </div>
      </div>
    </div>
  );
}
