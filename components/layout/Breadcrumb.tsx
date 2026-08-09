'use client';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm flex-wrap">
      <Link href="/" className="text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          {crumb.href && i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="text-gray-500 hover:text-primary-600 transition-colors font-medium">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
