import { Search, Bookmark, Star, Shield, Eye, Bell } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Instant Search',
    description: 'Find any resource in milliseconds with our Ctrl+K global search — search by title, subject, or year.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Eye,
    title: 'Inline PDF Preview',
    description: 'Preview documents directly in the browser without downloading. Supports Google Drive and Dropbox links.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks',
    description: 'Save resources to your personal library and access them anytime from your dashboard.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Star,
    title: 'Quality Ratings',
    description: 'Upvote or downvote resources so students know which materials are most helpful.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Bell,
    title: 'Resource Requests',
    description: 'Can\'t find what you need? Submit a request and admins will upload it for you.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Shield,
    title: 'Link Health Checker',
    description: 'We automatically verify all resource links so you never waste time on broken URLs.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section bg-surface-50">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Built with students in mind — from finding resources to saving them for exam season.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-6 hover:shadow-card-hover transition-shadow duration-200">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
