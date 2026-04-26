import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/app/header';
import { cn } from '@/lib/utils';
// HyperspeedBackground mounts the WebGL canvas ONCE for the entire app.
// It persists across page navigations — no teardown/recreate per route.
import HyperspeedBackground from '@/components/app/hyperspeed-background';

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'INVISIFY',
  description: 'A Steganography Detection System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', inter.variable)}>
      <body
        className={cn(
          'font-body antialiased h-full flex flex-col bg-black overflow-x-hidden p-0 m-0',
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        {/* Singleton WebGL background — renders once, persists across all routes */}
        <HyperspeedBackground />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}