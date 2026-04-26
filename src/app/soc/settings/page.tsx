'use client';

import { useState } from 'react';
import { Settings, Sliders, Globe, Bell, Database, Trash2, Shield } from 'lucide-react';
import { useLogStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { logs, clearLogs } = useLogStore();
  const { toast } = useToast();
  const [sensitivity, setSensitivity] = useState(50);
  const [notifications, setNotifications] = useState(true);
  const [autoScan, setAutoScan] = useState(true);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={12} className="text-purple-500" />
          <span className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
      </div>

      {/* Detection Settings */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Sliders size={14} className="text-emerald-500" /> Detection Sensitivity</h2>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-neutral-500">Threshold: {sensitivity}%</span>
            <span className="text-[10px] font-mono text-neutral-600">
              {sensitivity < 30 ? 'Low (fewer alerts)' : sensitivity < 70 ? 'Balanced' : 'High (more alerts)'}
            </span>
          </div>
          <input type="range" min="0" max="100" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
          />
        </div>
      </div>

      {/* API Configuration */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Globe size={14} className="text-cyan-500" /> API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono text-neutral-600 uppercase block mb-1">API Endpoint</label>
            <input type="text" value="/api/scan" readOnly className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-neutral-400" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-neutral-600 uppercase block mb-1">Gemini Model</label>
            <input type="text" value="gemini-1.5-flash" readOnly className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Bell size={14} className="text-amber-500" /> Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Alert Notifications</p>
            <p className="text-[10px] text-neutral-600">Show toast alerts for scan results</p>
          </div>
          <button onClick={() => setNotifications(!notifications)}
            className={cn('w-10 h-5 rounded-full transition-all', notifications ? 'bg-emerald-500' : 'bg-white/[0.1]')}>
            <div className={cn('w-4 h-4 bg-white rounded-full transition-all mx-0.5', notifications ? 'translate-x-5' : 'translate-x-0')} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Auto-Scan Extension</p>
            <p className="text-[10px] text-neutral-600">Automatically scan Gmail emails on open</p>
          </div>
          <button onClick={() => setAutoScan(!autoScan)}
            className={cn('w-10 h-5 rounded-full transition-all', autoScan ? 'bg-emerald-500' : 'bg-white/[0.1]')}>
            <div className={cn('w-4 h-4 bg-white rounded-full transition-all mx-0.5', autoScan ? 'translate-x-5' : 'translate-x-0')} />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Database size={14} className="text-blue-500" /> Data Management</h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div>
            <p className="text-sm text-white">{logs.length} scan records stored</p>
            <p className="text-[10px] text-neutral-600">LocalStorage • invisify-logs</p>
          </div>
          <button onClick={() => { clearLogs(); toast({ title: 'Archive Cleared' }); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono hover:bg-rose-500/20 transition-all">
            <Trash2 size={12} /> Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
