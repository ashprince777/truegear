import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CompareDock } from '@/components/CompareDock';
import { AuthModal } from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'TrueGear | Smart Car Marketplace & Deal Ratings',
  description: 'Search, compare, and evaluate used and new cars with instant algorithmic Deal Ratings. Find great deals near you.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CompareProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareDock />
            <AuthModal />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
