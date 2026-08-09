import { Search, Bookmark, Star, Shield, Eye, Bell } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Instant Search',
    description: 'Find any resource in milliseconds with our global search — search by title, subject, or branch.',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Eye,
    title: 'Inline Document Preview',
    description: 'Preview study materials directly in the browser without downloading.',
    color: 'bg-violet-500/10 text-violet-600',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks & Library',
    description: 'Save resources to your personal library and access them anytime from your dashboard.',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: Star,
    title: 'Quality Ratings',
    description: 'Upvote or downvote resources so students know which materials are most helpful.',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: Bell,
    title: 'Resource Requests',
    description: 'Can\'t find what you need? Submit a request and admins will upload it for you.',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    icon: Shield,
    title: 'Verified Links',
    description: 'We automatically verify all resource links so you never waste time on broken URLs.',
    color: 'bg-indigo-500/10 text-indigo-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="pt-2 pb-16 px-4">
      <div className="container-max">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
