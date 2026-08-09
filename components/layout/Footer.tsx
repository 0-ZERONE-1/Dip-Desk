import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-surface-200 mt-auto py-3.5">
      <div className="container-max px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-600 to-accent-500 rounded-md flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-xs">Dip-Desk</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Free study resources for all students</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-gray-400">© {new Date().getFullYear()} Dip-Desk</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
