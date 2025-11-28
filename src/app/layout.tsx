// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { FollowingProvider } from '@/contexts/FollowingContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptVerse',
  description: 'Trade and own AI Prompts securely.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-background text-foreground`}
      >
        <FavoritesProvider>
          <FollowingProvider>
            <Navbar />
            <main className="container mx-auto flex-grow px-4 pb-8 pt-20 sm:pt-24">{children}</main>
            <Footer />
            <Toaster />
          </FollowingProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
