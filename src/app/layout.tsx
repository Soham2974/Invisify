import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/app/header';
import { cn } from '@/lib/utils';
import HyperspeedBackground from '@/components/app/hyperspeed-background';
import { ThemeProvider } from '@/components/theme-provider';

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Invisify | Sentinel Prime SOC',
  description: 'Advanced Steganography Detection & Forensic Analysis System',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', inter.variable)} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'font-body antialiased h-full flex flex-col bg-white dark:bg-cyber-bg overflow-x-hidden p-0 m-0 transition-colors duration-300',
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        <ThemeProvider>
          {/* Singleton WebGL background — renders once, persists across all routes */}
          <HyperspeedBackground />
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}