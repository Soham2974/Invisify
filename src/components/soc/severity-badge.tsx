'use client';

import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const styles: Record<Severity, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  Safe:     { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]' },
  Low:      { bg: 'bg-teal-500/10',    text: 'text-teal-600 dark:text-teal-400',    border: 'border-teal-500/20',    dot: 'bg-teal-500',    glow: 'shadow-[0_0_8px_rgba(20,184,166,0.2)]' },
  Medium:   { bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-500',   glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]' },
  High:     { bg: 'bg-rose-500/10',    text: 'text-rose-600 dark:text-rose-400',    border: 'border-rose-500/20',     dot: 'bg-rose-500',    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.25)]' },
  Critical: { bg: 'bg-red-600/15',     text: 'text-red-600 dark:text-red-400',     border: 'border-red-500/30',      dot: 'bg-red-500',     glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]' },
};

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
}

export default function SeverityBadge({ severity, size = 'md', showDot = true, pulse, className }: SeverityBadgeProps) {
  const s = styles[severity];
  const shouldPulse = pulse ?? severity === 'Critical';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold tracking-wider uppercase transition-all duration-300',
        s.bg, s.text, s.border, s.glow,
        sizeClasses[size],
        shouldPulse && 'animate-pulse',
        className
      )}
    >
      {showDot && (
        <span className={cn('rounded-full shrink-0', s.dot, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      )}
      {severity}
    </span>
  );
}
