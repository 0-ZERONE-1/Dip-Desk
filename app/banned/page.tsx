export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>
        <p className="text-gray-500">Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.</p>
      </div>
    </div>
  );
}
