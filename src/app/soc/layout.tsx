import Sidebar from '@/components/soc/sidebar';

export const metadata = {
  title: 'SENTINEL PRIME — SOC Dashboard',
  description: 'Steganography Detection & Threat Intelligence Platform',
};

export default function SOCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-cyber-bg text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Ambient gradient mesh background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-neon/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/[0.015] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/[0.015] rounded-full blur-[100px]" />
        {/* Animated grid overlay */}
        <div className="absolute inset-0 animated-grid-bg-subtle opacity-10 dark:opacity-30" />
      </div>
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
