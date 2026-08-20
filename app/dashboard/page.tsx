'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import ResourceCard from '@/components/ResourceCard';
import GenericLottieLoader from '@/components/GenericLottieLoader';
import AnimatedSelect from '@/components/AnimatedSelect';
import {
  Bookmark, BookOpen, ThumbsUp, ThumbsDown, MessageSquarePlus, User, Edit3, Save, Loader2, CheckCircle, Clock, ShieldCheck, GraduationCap, X, Camera, LogOut, ExternalLink, Building2, Link as LinkIcon, LayoutDashboard, Bell, ArrowRight, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type ActiveTab = 'profile' | 'saved' | 'liked' | 'disliked' | 'requests';

interface ResourceItem {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  upvotes: number;
  downvotes: number;
  isActive: boolean;
  createdAt: string;
  ratings?: { userId: string; vote: 'up' | 'down' }[];
  isBookmarked?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  title: string;
  institute: string;
  regNumber: string;
  bookmarks: ResourceItem[];
}

export default function StudentPanelPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [allResources, setAllResources] = useState<ResourceItem[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  // Profile Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    title: 'Student',
    institute: '',
    regNumber: '',
  });

  // Request Form State
  const [requestDept, setRequestDept] = useState('Computer Science & Technology');
  const [requestSemester, setRequestSemester] = useState('Semester 3');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestCategory, setRequestCategory] = useState('Notes');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAllResources();
    fetchRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setEditForm({
          name: data.user.name || '',
          image: data.user.image || '',
          title: data.user.title || 'Student',
          institute: data.user.institute || '',
          regNumber: data.user.regNumber || '',
        });
      }
    } catch {}
    setLoading(false);
  };

  const fetchAllResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setAllResources(data.resources || []);
    } catch {}
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      toast.success('Profile updated successfully! 🎉');
      await updateSession({ name: editForm.name, image: editForm.image });
      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDesc) { toast.error('Please describe what resource you need'); return; }
    setSubmittingRequest(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: requestDept,
          semester: requestSemester,
          subjectTitle: requestSubject || 'General',
          category: requestCategory,
          url: requestUrl,
          description: requestDesc,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Resource request submitted! Admins will review it soon.');
      setRequestSubject('');
      setRequestUrl('');
      setRequestDesc('');
      await fetchRequests();
    } catch {
      toast.error('Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const currentUserId = (session?.user as any)?.id || 'demo_student_id';
  const userEmail = session?.user?.email;

  // Filtered resources
  const likedResources = allResources.filter((r) =>
    r.ratings?.some((rt) => (rt.userId === currentUserId || (userEmail && rt.userId === userEmail)) && rt.vote === 'up')
  );
  const dislikedResources = allResources.filter((r) =>
    r.ratings?.some((rt) => (rt.userId === currentUserId || (userEmail && rt.userId === userEmail)) && rt.vote === 'down')
  );
  const myRequests = requests.filter(
    (rq) => rq.studentId === currentUserId || (userEmail && rq.studentEmail === userEmail)
  );

  const displayAvatar = profile?.image || session?.user?.image;

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />

      {/* Mobile Navigation Horizontal Bar */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar py-2 px-3.5 flex items-center gap-1.5 border-b border-surface-200/80 bg-white sticky top-16 z-30 shadow-2xs">
        {[
          { id: 'profile', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'saved', label: 'Saved Resources', icon: Bookmark },
          { id: 'liked', label: 'Liked Resources', icon: ThumbsUp },
          { id: 'disliked', label: 'Disliked Resources', icon: ThumbsDown },
          { id: 'requests', label: 'My Requests', icon: MessageSquarePlus },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-150 shadow-2xs',
                active
                  ? 'text-white'
                  : 'bg-surface-50 text-gray-700 hover:bg-surface-100 border border-surface-200/90'
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-student-pill"
                  layout="position"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 shadow-md shadow-primary-500/25"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5 flex-shrink-0" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7">

        {/* Outer Layout: Sticky Left Sidebar + Main Content Area */}
        <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-7 items-start">

          {/* ===== LEFT SIDEBAR ===== */}
          <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 sticky top-20 self-start space-y-4">

            {/* 1. Profile Avatar Card */}
            <div className="card p-5 text-center">
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayAvatar}
                  alt={profile?.name || 'Student'}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 shadow-md border-2 border-primary-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-md shadow-primary-500/20">
                  {profile?.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <h2 className="font-bold text-gray-900 text-base">{profile?.name || session?.user?.name || 'Student User'}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{profile?.email || session?.user?.email}</p>
              <p className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full inline-block mt-2 border border-primary-100">
                {profile?.title || 'Student'}
              </p>
            </div>

            {/* 2. Student Controls Navigation Card */}
            <div className="card p-4 border border-surface-200/90 shadow-card rounded-3xl bg-white space-y-1.5">
              
              {/* Header Title */}
              <div className="px-3.5 py-3 mb-2 border-b border-surface-100 flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider text-gray-700 whitespace-nowrap">
                  Student Controls
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                  </span>
                  Live
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Dashboard', icon: LayoutDashboard, badge: null },
                  { id: 'saved', label: 'Saved Resources', icon: Bookmark, badge: profile?.bookmarks?.length || 0 },
                  { id: 'liked', label: 'Liked Resources', icon: ThumbsUp, badge: likedResources.length },
                  { id: 'disliked', label: 'Disliked Resources', icon: ThumbsDown, badge: dislikedResources.length },
                  { id: 'requests', label: 'My Requests', icon: MessageSquarePlus, badge: myRequests.length },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={cn(
                        'relative w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-colors duration-150 group',
                        active ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="desktop-student-pill"
                          layout="position"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 shadow-md shadow-primary-500/25"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                      {!active && (
                        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-surface-100 transition-opacity duration-150" />
                      )}
                      <div className="relative z-10 flex items-center gap-2.5">
                        <Icon className={cn('w-4 h-4 transition-colors', active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600')} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== null && tab.badge > 0 && (
                        <span className={cn('relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold', active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600')}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Footer Utilities */}
              <div className="pt-3 mt-2 border-t border-surface-100">
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {displayAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={displayAvatar} alt="User Avatar" className="w-7 h-7 rounded-full object-cover border border-primary-200 flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {profile?.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                    <div className="truncate min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{profile?.name || session?.user?.name || 'Student User'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{profile?.email || session?.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </aside>


          {/* ===== RIGHT MAIN CONTENT AREA ===== */}
          <div className="flex-1 w-full min-w-0">

            {/* Header Title Section (Matching Admin Dashboard Header 1:1) */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  {activeTab === 'profile' && <LayoutDashboard className="w-4 h-4" />}
                  {activeTab === 'saved' && <Bookmark className="w-4 h-4" />}
                  {activeTab === 'liked' && <ThumbsUp className="w-4 h-4" />}
                  {activeTab === 'disliked' && <ThumbsDown className="w-4 h-4" />}
                  {activeTab === 'requests' && <MessageSquarePlus className="w-4 h-4" />}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold gradient-text">
                  {activeTab === 'profile' && 'Student Dashboard'}
                  {activeTab === 'saved' && 'Saved Resources'}
                  {activeTab === 'liked' && 'Liked Resources'}
                  {activeTab === 'disliked' && 'Disliked Resources'}
                  {activeTab === 'requests' && 'My Requests'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {activeTab === 'profile' && 'Overview of your activity, profile, and study materials'}
                {activeTab === 'saved' && 'Manage your bookmarked study materials for quick offline access'}
                {activeTab === 'liked' && 'Study materials you upvoted and appreciated'}
                {activeTab === 'disliked' && 'Study materials you downvoted'}
                {activeTab === 'requests' && 'Submit and track your study material requests'}
              </p>
            </div>

            {/* TAB: DASHBOARD / MY PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* 1. TOP STAT CARDS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'saved', label: 'Saved Items', value: profile?.bookmarks?.length || 0, icon: Bookmark, color: 'text-primary-600 bg-primary-50 border-primary-100' },
                    { id: 'liked', label: 'Liked Materials', value: likedResources.length, icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { id: 'disliked', label: 'Disliked Materials', value: dislikedResources.length, icon: ThumbsDown, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { id: 'requests', label: 'Submitted Requests', value: myRequests.length, icon: MessageSquarePlus, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <button
                        key={stat.label}
                        onClick={() => setActiveTab(stat.id as ActiveTab)}
                        className="card p-4 flex items-center gap-3 text-left transition-all hover:shadow-card-hover hover:scale-[1.02]"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${stat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl font-extrabold text-gray-900 truncate">{stat.value}</p>
                          <p className="text-[11px] text-gray-500 font-medium truncate">{stat.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 2. STUDENT INFORMATION CARD */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-100">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-4.5 h-4.5 text-primary-600" />
                        Student Information
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">You can update your personal details and profile picture</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary text-xs px-4 py-2.5 shadow-md shadow-primary-500/25"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  {/* Profile Display Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: profile?.name || 'Not set' },
                      { label: 'Designation', value: profile?.title || 'Student' },
                      { label: 'Institute Name', value: profile?.institute || 'Not set' },
                      { label: 'Registration / Roll Number', value: profile?.regNumber || 'Not set' },
                    ].map((item) => (
                      <div key={item.label} className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                        <p className="text-[11px] text-gray-400 font-semibold">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. QUICK ACTIONS & SHORTCUTS (Matching Admin Dashboard Quick Actions 1:1) */}
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-1">Quick Actions & Shortcuts</h3>
                  <p className="text-xs text-gray-500 mb-4">Direct shortcuts to key student modules</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: 'Browse Resources',
                        desc: 'Explore notes, syllabus, and model question papers',
                        icon: BookOpen,
                        color: 'text-primary-600 bg-primary-50',
                        action: () => (window.location.href = '/browse'),
                      },
                      {
                        title: 'Request a Resource',
                        desc: 'Ask admins for missing notes or textbooks',
                        icon: MessageSquarePlus,
                        color: 'text-purple-600 bg-purple-50',
                        action: () => setActiveTab('requests'),
                      },
                      {
                        title: 'Edit Profile Details',
                        desc: 'Update designation, institute name, and photo',
                        icon: Edit3,
                        color: 'text-indigo-600 bg-indigo-50',
                        action: () => setIsEditing(true),
                      },
                      {
                        title: 'View Notice Board',
                        desc: 'Check exam schedules and campus updates',
                        icon: Bell,
                        color: 'text-blue-600 bg-blue-50',
                        action: () => (window.location.href = '/notices'),
                      },
                    ].map((act) => {
                      const Icon = act.icon;
                      return (
                        <div
                          key={act.title}
                          onClick={act.action}
                          className="card p-4 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
                              {act.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{act.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SAVED RESOURCES */}
            {activeTab === 'saved' && (
              <div className="w-full space-y-4">
                {loading ? (
                  <GenericLottieLoader text="Loading Saved Resources..." />
                ) : !profile?.bookmarks?.length ? (
                  <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[400px] w-full">
                    <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No saved resources yet</h4>
                    <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto">Click the bookmark icon on any resource while browsing to save it here for offline reference.</p>
                    <Link href="/browse" className="btn-primary text-xs px-5 py-2.5 shadow-md shadow-primary-500/25">Browse Resources</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.bookmarks.map((resource) => (
                      <ResourceCard key={resource._id} resource={{ ...resource, isBookmarked: true }} />
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* TAB: LIKED RESOURCES */}
            {activeTab === 'liked' && (
              <div className="w-full space-y-4">
                {!likedResources.length ? (
                  <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[400px] w-full">
                    <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No Upvoted Materials yet</h4>
                    <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto">Materials you upvote will show up here for your reference.</p>
                    <Link href="/browse" className="btn-primary text-xs px-5 py-2.5 shadow-md shadow-primary-500/25">Explore Study Materials</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {likedResources.map((resource) => (
                      <ResourceCard key={resource._id} resource={resource} />
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* TAB: DISLIKED RESOURCES */}
            {activeTab === 'disliked' && (
              <div className="w-full space-y-4">
                {!dislikedResources.length ? (
                  <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[400px] w-full">
                    <ThumbsDown className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No Downvoted Materials yet</h4>
                    <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto">Materials you downvote will show up here for your reference.</p>
                    <Link href="/browse" className="btn-primary text-xs px-5 py-2.5 shadow-md shadow-primary-500/25">Explore Study Materials</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dislikedResources.map((resource) => (
                      <ResourceCard key={resource._id} resource={resource} />
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* TAB: MY REQUESTS */}
            {activeTab === 'requests' && (
              <div className="space-y-6 min-h-[500px]">

                {/* Submit New Request Form */}
                <div className="card p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-purple-600" />
                    Request a Resource
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Can&apos;t find notes or question papers? Request them from admins!</p>

                  <form onSubmit={handleCreateRequest} className="space-y-4">
                    {/* Department & Semester Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                        <AnimatedSelect
                          value={requestDept}
                          onChange={(val) => setRequestDept(val)}
                          options={[
                            { value: 'Computer Science & Technology', label: 'Computer Science & Technology' },
                            { value: 'Electrical Engineering', label: 'Electrical Engineering' },
                            { value: 'Civil Engineering', label: 'Civil Engineering' },
                            { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                            { value: 'Electronics & Telecommunication', label: 'Electronics & Telecommunication' },
                            { value: 'General / Other', label: 'General / Other' },
                          ]}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                        <AnimatedSelect
                          value={requestSemester}
                          onChange={(val) => setRequestSemester(val)}
                          options={[
                            { value: 'Semester 1', label: 'Semester 1' },
                            { value: 'Semester 2', label: 'Semester 2' },
                            { value: 'Semester 3', label: 'Semester 3' },
                            { value: 'Semester 4', label: 'Semester 4' },
                            { value: 'Semester 5', label: 'Semester 5' },
                            { value: 'Semester 6', label: 'Semester 6' },
                            { value: 'All Semesters', label: 'All Semesters' },
                          ]}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Subject Title & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Topic Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Data Structures & Algorithms"
                          value={requestSubject}
                          onChange={(e) => setRequestSubject(e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                        <AnimatedSelect
                          value={requestCategory}
                          onChange={(val) => setRequestCategory(val)}
                          options={[
                            { value: 'Notes', label: 'Notes' },
                            { value: 'Textbooks', label: 'Textbooks' },
                            { value: 'Model Question Papers', label: 'Model Question Papers' },
                            { value: 'Lab Manuals', label: 'Lab Manuals' },
                            { value: 'Syllabus', label: 'Syllabus' },
                            { value: 'Routines', label: 'Routines' },
                            { value: 'Other', label: 'Other' },
                          ]}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Optional Source Link URL */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Source Link / Reference URL <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or textbook link"
                        value={requestUrl}
                        onChange={(e) => setRequestUrl(e.target.value)}
                        className="input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Details</label>
                      <textarea
                        rows={3}
                        placeholder="Specify semester, year, or chapter details..."
                        value={requestDesc}
                        onChange={(e) => setRequestDesc(e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="btn-primary py-2.5 px-6 text-xs"
                      >
                        {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Request</span>}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Submitted Requests List */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Submitted Requests ({myRequests.length})</h4>
                  {!myRequests.length ? (
                    <div className="card p-8 text-center text-gray-400 text-xs">
                      You have not submitted any resource requests yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.map((rq) => (
                        <div key={rq._id} className="card p-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-gray-900">{rq.subjectTitle || 'Resource Request'}</span>
                              <span className="badge-primary text-[10px]">{rq.category}</span>
                              {rq.department && <span className="bg-surface-200/70 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">{rq.department}</span>}
                              {rq.semester && <span className="bg-primary-50 text-primary-700 border border-primary-100 text-[10px] font-semibold px-2 py-0.5 rounded-md">{rq.semester}</span>}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{rq.description}</p>
                            {rq.url && (
                              <a
                                href={rq.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline mt-1.5"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                                <span>Source Link</span>
                                <ExternalLink className="w-3 h-3 opacity-70" />
                              </a>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">Submitted on {new Date(rq.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {rq.status === 'fulfilled' || rq.status === 'approved' ? (
                              <span className="badge-success text-xs">Fulfilled ✓</span>
                            ) : (
                              <span className="badge-warning text-xs">Pending ⏳</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* ===== EDIT PROFILE MODAL POPUP (Admin Modal Popup Style) ===== */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            {/* Outer gradient cap wrapper matching the Add New Subject modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-[1.5px] pt-3.5 rounded-[32px] shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Inner modal body with rounded top corners under the top gradient band */}
              <div className="bg-white rounded-b-[30px] rounded-t-[20px] w-full flex-1 flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between bg-gradient-to-b from-primary-50/40 to-transparent flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-extrabold gradient-text">Edit Student Profile</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Update your personal details and avatar image</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-surface-100 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">

                {/* Profile Picture Link & Live Preview */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Profile Picture URL (Image Link)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-100 border border-surface-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {editForm.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={editForm.image}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Paste a direct image URL (JPEG/PNG/WebP)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                    <select
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="select"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Human">Human</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Institute Name</label>
                    <input
                      type="text"
                      value={editForm.institute}
                      onChange={(e) => setEditForm({ ...editForm, institute: e.target.value })}
                      className="input"
                      placeholder="e.g. Government Polytechnic"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Registration / Roll Number</label>
                    <input
                      type="text"
                      value={editForm.regNumber}
                      onChange={(e) => setEditForm({ ...editForm, regNumber: e.target.value })}
                      className="input"
                      placeholder="e.g. D2425000"
                      required
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-surface-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary text-xs py-2.5 px-6 shadow-md shadow-primary-500/25"
                  >
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
