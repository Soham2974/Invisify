'use client';

import { useState } from 'react';
import { Settings, Sliders, Globe, Bell, Database, Trash2, Shield, Sun, Moon, Monitor } from 'lucide-react';
import { useLogStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { logs, clearLogs } = useLogStore();
  const { toast } = useToast();
  const [sensitivity, setSensitivity] = useState(50);
  const [notifications, setNotifications] = useState(true);
  const [autoScan, setAutoScan] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useState(() => { setMounted(true); });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={12} className="text-purple-500" />
          <span className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sun size={14} className="text-amber-500" /> Appearance</h2>
        <div className="flex items-center gap-3">
          {[
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border shadow-sm active:scale-95',
                theme === value
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-500 hover:text-slate-700 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              )}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Detection Settings */}
      <div className="glass-card p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sliders size={14} className="text-emerald-500" /> Detection Sensitivity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Threshold Balance</span>
              <p className="text-[10px] text-slate-500">Adjust the engine's sensitivity to anomalies</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {sensitivity}% — {sensitivity < 30 ? 'LOW' : sensitivity < 70 ? 'BALANCED' : 'HIGH'}
            </span>
          </div>
          <input type="range" min="0" max="100" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 transition-all"
          />
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-card p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Globe size={14} className="text-cyan-500" /> API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">API Endpoint</label>
            <input type="text" value="/api/scan" readOnly className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-xs font-mono text-slate-600 dark:text-neutral-400 focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Gemini Model</label>
            <input type="text" value="gemini-1.5-flash" readOnly className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-xs font-mono text-slate-600 dark:text-neutral-400 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell size={14} className="text-amber-500" /> Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Alert Notifications</p>
              <p className="text-[10px] text-slate-500">Show toast alerts for critical scan results</p>
            </div>
            <button onClick={() => setNotifications(!notifications)}
              className={cn('w-11 h-6 rounded-full transition-all relative', notifications ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.1]')}>
              <div className={cn('w-4 h-4 bg-white rounded-full transition-all absolute top-1 shadow-sm', notifications ? 'left-6' : 'left-1')} />
            </button>
          </div>
          <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />
          <div className="flex items-center justify-between p-2">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Scan Extension</p>
              <p className="text-[10px] text-slate-500">Automatically scan Gmail emails on interaction</p>
            </div>
            <button onClick={() => setAutoScan(!autoScan)}
              className={cn('w-11 h-6 rounded-full transition-all relative', autoScan ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.1]')}>
              <div className={cn('w-4 h-4 bg-white rounded-full transition-all absolute top-1 shadow-sm', autoScan ? 'left-6' : 'left-1')} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 space-y-5 shadow-sm border-rose-500/10 bg-rose-50/10 dark:bg-rose-500/[0.01]">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Database size={14} className="text-blue-500" /> Data Management</h2>
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{logs.length} scan records stored</p>
            <p className="text-[10px] text-slate-500 font-mono">LOCAL_STORAGE // INVISIFY_LOGS</p>
          </div>
          <button onClick={() => { clearLogs(); toast({ title: 'Archive Cleared' }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all active:scale-95 shadow-sm">
            <Trash2 size={12} /> Wipe All Data
          </button>
        </div>
      </div>
    </div>
  );
}
