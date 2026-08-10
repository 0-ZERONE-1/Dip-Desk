import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <div className="flex-1 ml-0 md:ml-64 min-h-screen">
        <div className="p-4 pt-5 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
