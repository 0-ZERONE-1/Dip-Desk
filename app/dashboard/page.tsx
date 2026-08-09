'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ResourceCard from '@/components/ResourceCard';
import { Bookmark, BookOpen, Loader2, User } from 'lucide-react';
import Link from 'next/link';

interface BookmarkedResource {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  upvotes: number;
  downvotes: number;
  isActive: boolean;
  createdAt: string;
  isBookmarked: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  title: string;
  institute: string;
  regNumber: string;
  bookmarks: BookmarkedResource[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const user = session?.user as any;

  return (
    <>
      <Navbar />
      <main className="container-max px-4 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full border-2 border-primary-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Library</h1>
            <p className="text-gray-500 text-sm mt-0.5">{profile?.institute && `${profile.institute} · `}{profile?.title}</p>
          </div>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="card p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Name', value: profile.name },
              { label: 'Title', value: profile.title },
              { label: 'Institute', value: profile.institute },
              { label: 'Roll Number', value: profile.regNumber },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Bookmarks */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary-600" />
            Saved Resources
            {profile?.bookmarks?.length !== undefined && (
              <span className="badge-primary">{profile.bookmarks.length}</span>
            )}
          </h2>
          <Link href="/browse" className="btn-ghost text-sm">Browse More →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : !profile?.bookmarks?.length ? (
          <div className="card p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 text-sm mb-4">Save resources by clicking the bookmark icon on any material.</p>
            <Link href="/browse" className="btn-primary mx-auto">Browse Resources</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.bookmarks.map((resource) => (
              <ResourceCard key={resource._id} resource={{ ...resource, isBookmarked: true }} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
