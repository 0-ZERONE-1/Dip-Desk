import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      {/* On mobile, pt-[72px] = 56px fixed top bar + 16px breathing room. On desktop, normal padding */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen pt-[72px] md:pt-0">
        <div className="px-4 pb-8 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
