import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import ConditionalNavbar from '@/components/layout/ConditionalNavbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Dip-Desk — User Resource Platform',
    template: '%s | Dip-Desk',
  },
  description:
    'A centralized platform for Diploma users to access notes, books, model question papers, and lab manuals for every subject and semester.',
  keywords: ['diploma', 'study materials', 'notes', 'question papers', 'lab manuals', 'CST', 'EE', 'ETC'],
  authors: [{ name: 'Dip-Desk' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Dip-Desk — User Resource Platform',
    description: 'Access free study materials for Diploma users across all branches and semesters.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dip-Desk Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dip-Desk — User Resource Platform',
    description: 'Access free study materials for Diploma users across all branches and semesters.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased text-gray-900">
        <Providers>
          <div className="flex-1 flex flex-col min-h-screen">
            <ConditionalNavbar />
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-sm font-medium',
              style: {
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
