'use client';

import { useState, useEffect } from 'react';
import { useLogStore } from '@/lib/store';
import { DUMMY_SCANS, ACTIVITY_EVENTS } from '@/lib/soc-dummy-data';
import ThreatOverview from '@/components/soc/threat-overview';
import RiskGauge from '@/components/soc/risk-gauge';
import DetectionBreakdownChart from '@/components/soc/detection-breakdown-chart';
import ScanTimelineChart from '@/components/soc/scan-timeline-chart';
import LiveActivityFeed from '@/components/soc/live-activity-feed';
import ScanHistoryTable from '@/components/soc/scan-history-table';
import SeverityBadge from '@/components/soc/severity-badge';
import { Activity, Shield, Zap, Clock, Radio, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SOCDashboardPage() {
  const { logs } = useLogStore();
  const [clockStr, setClockStr] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fmt = () => {
      const d = new Date();
      setClockStr(`${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    };
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);

  const scans = [...logs, ...DUMMY_SCANS];
  const latestScan = scans[0];

  return (
    <div className={`p-6 lg:p-8 space-y-8 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400/70 uppercase tracking-[0.2em]">Cascade Engine Active</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
            Threat Operations Center
          </h1>
          <p className="text-sm text-neutral-500 font-medium">Real-time steganography detection & hidden threat analysis</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <Clock size={13} className="text-neutral-500" />
            <span className="text-[11px] font-mono text-neutral-400">{clockStr || '\u00A0'}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/[0.08] to-cyan-500/[0.05] border border-emerald-500/15">
            <Zap size={13} className="text-emerald-400" />
            <span className="text-[11px] font-mono font-bold text-emerald-400/80 tracking-wider">3-TIER CASCADE</span>
          </div>
          <Link href="/soc/scanner" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Sparkles size={13} /> Launch Scanner
          </Link>
        </div>
      </div>

      {/* ═══════════════════ KPI CARDS ═══════════════════ */}
      <ThreatOverview scans={scans} />

      {/* ═══════════════════ LATEST SCAN + PIE CHART ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Scan Result — Hero Card */}
        <div className="lg:col-span-7 relative rounded-2xl border border-white/[0.06] overflow-hidden group">
          {/* Card gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-emerald-950/10" />
          <div className="relative">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Shield size={14} className="text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Latest Scan Result</span>
              </div>
              {latestScan && <SeverityBadge severity={latestScan.severity} size="sm" />}
            </div>
            <div className="p-6">
              {latestScan ? (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/[0.06] rounded-full blur-2xl scale-150" />
                    <RiskGauge score={latestScan.score} severity={latestScan.severity} size={150} />
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Content Type</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                            <Radio size={11} className="text-cyan-400" />
                          </div>
                          <span className="text-sm font-semibold text-white">{latestScan.content_type} Analysis</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Confidence</p>
                        <span className="text-sm font-semibold text-white">
                          {(() => { try { const f = JSON.parse(latestScan.findings); return `${((f.ensemble_confidence || 0) * 100).toFixed(0)}%`; } catch { return 'N/A'; } })()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">AI Summary</p>
                      <p className="text-[13px] text-neutral-300/90 leading-relaxed">{latestScan.summary}</p>
                    </div>
                    {latestScan.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {latestScan.reasons.slice(0, 3).map((r, i) => (
                          <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-amber-400/70">
                            {r.length > 45 ? r.slice(0, 45) + '…' : r}
                          </span>
                        ))}
                        {latestScan.reasons.length > 3 && (
                          <span className="text-[10px] font-mono text-neutral-600 self-center">+{latestScan.reasons.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-neutral-600">
                  <Shield size={36} className="mx-auto mb-4 text-neutral-700" />
                  <p className="text-sm font-semibold">AWAITING SCAN</p>
                  <p className="text-xs mt-1 text-neutral-700">Run a scan to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detection Breakdown — Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.06] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-purple-950/10" />
          <div className="relative">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Activity size={14} className="text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Detection Breakdown</span>
            </div>
            <div className="p-4 h-[300px]">
              <DetectionBreakdownChart scans={scans} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ TIMELINE + ACTIVITY FEED ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.06] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-cyan-950/10" />
          <div className="relative">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Activity size={14} className="text-cyan-400" />
              </div>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Threat Score Timeline</span>
            </div>
            <div className="p-4 h-[300px]">
              <ScanTimelineChart scans={scans} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-white/[0.06] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-amber-950/10" />
          <div className="relative">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Zap size={14} className="text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Live Activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-neutral-600">LIVE</span>
              </div>
            </div>
            <div className="p-3 h-[300px] overflow-hidden">
              <LiveActivityFeed events={ACTIVITY_EVENTS} maxVisible={6} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ SCAN HISTORY TABLE ═══════════════════ */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#0d1117]" />
        <div className="relative">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Clock size={14} className="text-neutral-400" />
              </div>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Scan History</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-600">{scans.length} records</span>
              <Link href="/soc/history" className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/60 hover:text-emerald-400 transition-colors">
                View All <ArrowRight size={10} />
              </Link>
            </div>
          </div>
          <ScanHistoryTable scans={scans} pageSize={5} />
        </div>
      </div>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-700/60 py-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />ENGINE ONLINE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />ZUSTAND STORE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />GEMINI AI
          </span>
        </div>
        <span className="tracking-wider">SENTINEL PRIME // INVISIFY // v4.2.0</span>
      </div>
    </div>
  );
}
