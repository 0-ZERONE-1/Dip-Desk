import { BookOpen, Layers, Bell, Eye, PlusCircle, Bookmark } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Notes & Previous Question Papers',
    description: 'Access curated lecture notes, reference books, model question papers, and lab manuals tailored for every semester.',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Layers,
    title: 'Branch & Semester Filters',
    description: 'Quickly navigate resources organized cleanly by department (CST, EE, ME, Civil, ETC) and semester in seconds.',
    color: 'bg-violet-500/10 text-violet-600',
  },
  {
    icon: Bell,
    title: 'Live Notice & Exam Alerts',
    description: 'Stay up-to-date with official exam routines, syllabus updates, and urgent department announcements.',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: Eye,
    title: 'Instant Online Document Viewer',
    description: 'Preview PDFs, study guides, and question papers directly in your browser without taking up device storage.',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: PlusCircle,
    title: 'Request Missing Materials',
    description: 'Can\'t find a specific subject note or lab manual? Submit a request and administrators will upload it for you.',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    icon: Bookmark,
    title: 'Personal Bookmarks & Saved Library',
    description: 'Save your most-used subject materials into your personal dashboard for instant 1-click access during exam season.',
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
