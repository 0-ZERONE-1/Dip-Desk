'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ResourceCard from '@/components/ResourceCard';
import {
  Bookmark, BookOpen, ThumbsUp, ThumbsDown, MessageSquarePlus, User, Edit3, Save, Loader2, CheckCircle, Clock, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    title: 'Student',
    institute: '',
    regNumber: '',
  });

  // Request Form State
  const [requestSubject, setRequestSubject] = useState('');
  const [requestCategory, setRequestCategory] = useState('Notes');
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
      await updateSession({ name: editForm.name });
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
          subjectTitle: requestSubject || 'General',
          category: requestCategory,
          description: requestDesc,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Resource request submitted! Admins will review it soon.');
      setRequestSubject('');
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

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />

      <main className="flex-1 container-max px-4 py-8">
        {/* Header Title */}
        <div className="mb-6 pb-4 border-b border-surface-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-sm">
                🎓
              </span>
              Student Panel
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your profile, bookmarks, ratings, and requested study materials
            </p>
          </div>
        </div>

        {/* Grid Layout: Left Sidebar + Right Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* ===== LEFT SIDEBAR (Fixed Width / Aspect Ratio) ===== */}
          <aside className="lg:col-span-1 space-y-4">

            {/* Profile Avatar Card */}
            <div className="card p-5 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-md">
                {profile?.name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <h2 className="font-bold text-gray-900 text-base">{profile?.name || session?.user?.name || 'Student User'}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{profile?.email || session?.user?.email}</p>
              <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block mt-2 border border-blue-100">
                {profile?.title || 'Student'}
              </p>
            </div>

            {/* Navigation Tabs List */}
            <div className="card p-2 space-y-1">
              {[
                { id: 'profile', label: 'My Profile', icon: User, badge: null },
                { id: 'saved', label: 'Saved Resources', icon: Bookmark, badge: profile?.bookmarks?.length || 0 },
                { id: 'liked', label: 'Liked Resources', icon: ThumbsUp, badge: likedResources.length },
                { id: 'disliked', label: 'Disliked Resources', icon: ThumbsDown, badge: dislikedResources.length },
                { id: 'requests', label: 'My Requests', icon: MessageSquarePlus, badge: myRequests.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== null && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>


          {/* ===== RIGHT CONTENT PANEL (Consistent Top Ratio & Alignment) ===== */}
          <div className="lg:col-span-3 space-y-6">

            {/* 1. FIXED TOP STUDENT INFORMATION CARD (Keeps ratio identical across ALL tabs) */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Student Information
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">You can update your personal details anytime</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (activeTab !== 'profile') setActiveTab('profile');
                  }}
                  className="btn-secondary text-xs px-3.5 py-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Title / Designation</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="input"
                        placeholder="e.g. Student, CST Diploma"
                        required
                      />
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

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary py-2.5 px-6"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Display Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: profile?.name || 'Not set' },
                    { label: 'Title / Designation', value: profile?.title || 'Student' },
                    { label: 'Institute Name', value: profile?.institute || 'Not set' },
                    { label: 'Registration / Roll Number', value: profile?.regNumber || 'Not set' },
                  ].map((item) => (
                    <div key={item.label} className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                      <p className="text-[11px] text-gray-400 font-semibold">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. FIXED OVERVIEW STATS CARDS (Keeps aspect ratio consistent) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'saved', label: 'Saved Items', count: profile?.bookmarks?.length || 0, icon: Bookmark, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { id: 'liked', label: 'Liked Materials', count: likedResources.length, icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { id: 'disliked', label: 'Disliked Materials', count: dislikedResources.length, icon: ThumbsDown, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { id: 'requests', label: 'Submitted Requests', count: myRequests.length, icon: MessageSquarePlus, color: 'text-purple-600 bg-purple-50 border-purple-100' },
              ].map((stat) => {
                const Icon = stat.icon;
                const isCurrent = activeTab === stat.id;
                return (
                  <button
                    key={stat.label}
                    onClick={() => setActiveTab(stat.id as ActiveTab)}
                    className={`card p-4 flex items-center gap-3 text-left transition-all ${
                      isCurrent ? 'ring-2 ring-blue-600 shadow-md' : 'hover:shadow-card-hover'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{stat.count}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{stat.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>


            {/* 3. TAB SPECIFIC CONTENT (Renders smoothly underneath without changing top ratio) */}

            {/* TAB 2: SAVED RESOURCES */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    Saved Resources ({profile?.bookmarks?.length || 0})
                  </h3>
                  <Link href="/browse" className="btn-ghost text-xs">Browse More →</Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
                  </div>
                ) : !profile?.bookmarks?.length ? (
                  <div className="card p-10 text-center">
                    <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No saved resources yet</h4>
                    <p className="text-xs text-gray-400 mb-4">Click the bookmark icon on any resource while browsing to save it here.</p>
                    <Link href="/browse" className="btn-primary mx-auto text-xs px-5 py-2.5">Browse Resources</Link>
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


            {/* TAB 3: LIKED RESOURCES */}
            {activeTab === 'liked' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    Liked Resources ({likedResources.length})
                  </h3>
                </div>

                {!likedResources.length ? (
                  <div className="card p-10 text-center">
                    <ThumbsUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No Upvoted Materials yet</h4>
                    <p className="text-xs text-gray-400 mb-4">Materials you upvote will show up here for your reference.</p>
                    <Link href="/browse" className="btn-primary mx-auto text-xs px-5 py-2.5">Explore Study Materials</Link>
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


            {/* TAB 4: DISLIKED RESOURCES */}
            {activeTab === 'disliked' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-amber-600" />
                    Disliked Resources ({dislikedResources.length})
                  </h3>
                </div>

                {!dislikedResources.length ? (
                  <div className="card p-10 text-center">
                    <ThumbsDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-700 mb-1">No Downvoted Materials yet</h4>
                    <p className="text-xs text-gray-400 mb-4">Materials you downvote will show up here for your reference.</p>
                    <Link href="/browse" className="btn-primary mx-auto text-xs px-5 py-2.5">Explore Study Materials</Link>
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


            {/* TAB 5: MY REQUESTS */}
            {activeTab === 'requests' && (
              <div className="space-y-6">

                {/* Submit New Request Form */}
                <div className="card p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-purple-600" />
                    Request a Resource
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Can&apos;t find notes or question papers? Request them from admins!</p>

                  <form onSubmit={handleCreateRequest} className="space-y-4">
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
                        <select
                          value={requestCategory}
                          onChange={(e) => setRequestCategory(e.target.value)}
                          className="select"
                        >
                          <option value="Notes">Notes</option>
                          <option value="Textbooks">Textbooks</option>
                          <option value="Model Question Papers">Model Question Papers</option>
                          <option value="Lab Manuals">Lab Manuals</option>
                        </select>
                      </div>
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{rq.subjectTitle || 'Resource Request'}</span>
                              <span className="badge-primary text-[10px]">{rq.category}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{rq.description}</p>
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

      <Footer />
    </div>
  );
}
