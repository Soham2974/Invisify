'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StegoShieldLogo } from '@/components/app/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const pathname = usePathname();

  // Hide legacy header on SOC dashboard — it has its own sidebar navigation
  if (pathname.startsWith('/soc')) {
    return null;
  }

  const navItems = [
    { href: '/scan', label: 'Scan' },
    { href: '/soc', label: 'Dashboard' },
    { href: '/tools', label: 'Tools' },
    { href: '/detection-methods', label: 'Detection Methods' },
    { href: '/about', label: 'About Us' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-8 py-5 border-b border-black/5 dark:border-white/[0.04] bg-white/95 dark:bg-[#060910]/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <StegoShieldLogo className="h-5 w-5 text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-neutral-300 transition-colors duration-300" />
          <h1 className="text-[15px] font-semibold text-black dark:text-white tracking-tight">
            INVISIFY
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-medium transition-colors duration-200",
                pathname === item.href
                  ? "text-black dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-200"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle className="hidden md:flex" />
          <Button asChild size="sm" className="hidden md:flex bg-black dark:btn-solid-white hover:bg-neutral-800 text-white dark:text-black rounded-full h-8 px-5 text-[11px] tracking-wide">
            <Link href="/scan">Launch Scan</Link>
          </Button>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-full" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white/95 dark:bg-cyber-bg/95 backdrop-blur-2xl border-black/5 dark:border-white/[0.06] text-black dark:text-white w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="text-left text-black dark:text-white font-black flex items-center gap-2.5">
                      <StegoShieldLogo className="w-5 h-5 text-emerald-600 dark:text-neon" />
                      INVISIFY
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "px-4 py-3 rounded-xl transition-all duration-300 h-12 flex items-center text-sm font-medium",
                          pathname === item.href
                            ? "bg-emerald-500/10 dark:bg-neon/10 text-emerald-600 dark:text-neon border border-emerald-500/20 dark:border-neon/20"
                            : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button asChild className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white dark:btn-glow-green h-12 rounded-xl text-sm">
                      <Link href="/scan">Start Forensic Scan</Link>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
