'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  children?: ReactNode;
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, accentColor = 'emerald', children, className }: StatCardProps) {
  const colorMap: Record<string, { glow: string; iconBg: string; text: string; trendUp: string; trendDown: string; gradient: string; hoverBorder: string }> = {
    emerald: { glow: 'shadow-emerald-500/5', iconBg: 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/15', text: 'text-emerald-400', trendUp: 'text-emerald-400', trendDown: 'text-rose-400', gradient: 'from-emerald-500/[0.03]', hoverBorder: 'hover:border-emerald-500/20' },
    cyan:    { glow: 'shadow-cyan-500/5',    iconBg: 'bg-cyan-500/[0.08] text-cyan-400 border-cyan-500/15',         text: 'text-cyan-400',    trendUp: 'text-emerald-400', trendDown: 'text-rose-400', gradient: 'from-cyan-500/[0.03]',    hoverBorder: 'hover:border-cyan-500/20' },
    amber:   { glow: 'shadow-amber-500/5',   iconBg: 'bg-amber-500/[0.08] text-amber-400 border-amber-500/15',      text: 'text-amber-400',   trendUp: 'text-amber-400',   trendDown: 'text-emerald-400', gradient: 'from-amber-500/[0.03]',   hoverBorder: 'hover:border-amber-500/20' },
    rose:    { glow: 'shadow-rose-500/5',     iconBg: 'bg-rose-500/[0.08] text-rose-400 border-rose-500/15',         text: 'text-rose-400',    trendUp: 'text-rose-400',     trendDown: 'text-emerald-400', gradient: 'from-rose-500/[0.03]',    hoverBorder: 'hover:border-rose-500/20' },
    purple:  { glow: 'shadow-purple-500/5',   iconBg: 'bg-purple-500/[0.08] text-purple-400 border-purple-500/15',   text: 'text-purple-400',  trendUp: 'text-purple-400',   trendDown: 'text-emerald-400', gradient: 'from-purple-500/[0.03]',  hoverBorder: 'hover:border-purple-500/20' },
  };

  const c = colorMap[accentColor] || colorMap.emerald;

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl',
        'border border-neutral-200 dark:border-white/[0.06]',
        'transition-all duration-500 group',
        `dark:${c.hoverBorder}`,
        c.hoverBorder,
        'hover:-translate-y-0.5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {/* Card gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-60', c.gradient)} />
      <div className="absolute inset-0 bg-white/90 dark:bg-[#0B0F14]/80 transition-colors duration-300" />

      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-semibold text-neutral-500/80 uppercase tracking-wider">{title}</span>
          {icon && (
            <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110', c.iconBg)}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">{value}</span>
          {trend && (
            <span className={cn('text-[11px] font-mono font-semibold mb-1', trend.value >= 0 ? c.trendUp : c.trendDown)}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] text-neutral-500/70 mt-1.5">{subtitle}</p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
