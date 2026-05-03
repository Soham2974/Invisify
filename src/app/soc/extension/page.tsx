'use client';

import { useEffect, useState } from 'react';
import ExtensionEventsTable from '@/components/soc/extension-events';
import type { ExtensionEvent } from '@/lib/soc-types';
import { Chrome, Wifi, Shield, ShieldCheck, ShieldX, Database, Download } from 'lucide-react';

export default function ExtensionPage() {
  const [events, setEvents] = useState<ExtensionEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      try {
        const res = await fetch('/api/extension-events?limit=200', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch extension events');
        const data = await res.json();
        if (!cancelled) {
          setEvents(Array.isArray(data.events) ? data.events : []);
          setIsConnected(true);
        }
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    };

    loadEvents();
    const id = setInterval(loadEvents, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const blockedCount = events.filter((event) => event.action === 'blocked').length;
  const warnedCount = events.filter((event) => event.action === 'warned').length;
  const allowedCount = events.filter((event) => event.action === 'allowed').length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chrome size={12} className="text-cyan-500" />
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Extension Interface</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Extension Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gmail scanning events and browser extension status</p>
        </div>

        <a
          href="/api/download-extension"
          download="sentinel-prime-extension.zip"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all text-xs font-mono font-bold shadow-lg shadow-cyan-500/5 active:scale-95"
        >
          <Download size={14} className="animate-bounce" />
          Download Extension ZIP
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 shadow-sm border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Status</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{isConnected ? 'Connected' : 'Disconnected'}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap">/api/extension-events</p>
        </div>
        <div className="glass-card p-5 shadow-sm border-rose-500/20 dark:border-rose-500/10 bg-rose-50/30 dark:bg-rose-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <ShieldX size={14} className="text-rose-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Blocked</span>
          </div>
          <p className="text-3xl font-bold text-rose-500 dark:text-rose-400">{blockedCount}</p>
        </div>
        <div className="glass-card p-5 shadow-sm border-amber-500/20 dark:border-amber-500/10 bg-amber-50/30 dark:bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-amber-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Warned</span>
          </div>
          <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">{warnedCount}</p>
        </div>
        <div className="glass-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Allowed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{allowedCount}</p>
        </div>
      </div>

      <div className="glass-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Extension Version</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Manifest V3</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">SHA-256 Cache</p>
            <div className="flex items-center gap-2">
              <Database size={14} className="text-cyan-500" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">{events.length} fingerprints</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Detection Mode</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">API + Local Fallback</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
          <div className="flex items-center gap-2">
            <Chrome size={14} className="text-cyan-500" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Gmail Scan Events</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">{events.length} events detected</span>
        </div>
        <ExtensionEventsTable events={events} />
      </div>
    </div>
  );
}
