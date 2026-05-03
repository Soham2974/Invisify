import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, ShieldCheck, Eye, Search, Mail, Download, 
  FileText, CheckCircle2, Terminal
} from 'lucide-react';
import SpotlightCard from '@/components/app/spotlight-card';
import DecryptedText from '@/components/app/decrypted-text';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#060910] text-black dark:text-white selection:bg-neon/20 font-body overflow-x-hidden transition-colors duration-300">
      
      {/* ═══════════ V1 SUBTLE GRID BACKGROUND ═══════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 animated-grid-bg opacity-10 dark:opacity-30" />
      </div>

      {/* ═══════════════════════════════════════════════════
          🧭 HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-40 sm:pt-48 pb-24 px-6 flex flex-col items-center text-center">
        
        {/* V1 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-neon/[0.03] border border-emerald-500/20 dark:border-neon/20 text-emerald-600 dark:text-neon text-[11px] font-medium mb-8 animate-fade-in-up">
          <ShieldCheck size={14} />
          <span>Next-Generation Steganography Detection</span>
        </div>

        {/* Main Heading with Decrypted Text Intro */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-[-0.05em] mb-6 leading-[0.85] text-black dark:text-white animate-fade-in-up delay-100">
          <DecryptedText
            text="INVISIFY"
            speed={100}
            maxIterations={20}
            className="text-black dark:text-white"
            encryptedClassName="text-neutral-400 dark:text-neutral-500"
          />
        </h1>

        {/* Subtitle */}
        <p className="max-w-[700px] text-[15px] sm:text-[17px] text-neutral-600 dark:text-neutral-400 mb-10 leading-[1.6] animate-fade-in-up delay-200">
          Uncover hidden data with forensic precision. Our advanced engine
          detects steganography across text, images, and binary streams—now
          including real-time protection with our Email Guard extension.
        </p>

        {/* V1 CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
          <Button asChild size="lg" className="h-12 px-8 bg-black dark:btn-solid-white hover:bg-neutral-800 text-white dark:text-black rounded-full text-[13px]">
            <Link href="/scan">
              Start Forensic Scan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-neutral-600 dark:text-neutral-300 bg-transparent border-black/10 dark:border-white/[0.1] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white rounded-full transition-colors text-[13px]">
            <Link href="/documentation">
              View Documentation
            </Link>
          </Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ⚡ CAPABILITIES SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-black dark:text-white mb-3">
              Powerful Detection Capabilities
            </h2>
            <p className="text-[14px] text-neutral-600 dark:text-neutral-500">
              Advanced tools designed for security researchers and forensic analysts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 — Real-time Vision Engine */}
            <SpotlightCard className="group flex flex-col h-full !p-8 bg-white dark:bg-[#060910] border-black/5 dark:border-white/[0.03]">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-neon/[0.05] border border-emerald-500/20 dark:border-neon/10 flex items-center justify-center text-emerald-600 dark:text-neon mb-6">
                <Eye size={22} />
              </div>
              <h3 className="text-[18px] font-bold mb-3 text-black dark:text-white tracking-tight">Real-time Vision Engine</h3>
              <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-[1.6] mb-12 flex-1">
                Scan images for LSB substitution, Chi-Square attacks, and Sample Pair
                Analysis with instant risk scoring.
              </p>
              <div className="flex items-center justify-between pt-5 border-t border-black/5 dark:border-white/[0.04] mt-auto">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-neon uppercase tracking-widest">
                  SC-01 // IMAGE_ANALYSIS
                </span>
                <Link href="/scan" className="text-[12px] text-black dark:text-white flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-neon transition-colors font-medium">
                  Launch Analyzer <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Card 2 — Unicode Sanitizer */}
            <SpotlightCard className="group flex flex-col h-full !p-8 bg-white dark:bg-[#060910] border-black/5 dark:border-white/[0.03]">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/[0.05] border border-blue-500/20 dark:border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <FileText size={22} />
              </div>
              <h3 className="text-[18px] font-bold mb-3 text-black dark:text-white tracking-tight">Unicode Sanitizer</h3>
              <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-[1.6] mb-12 flex-1">
                Detect and remove zero-width characters, BIDI overrides, and
                homoglyph attacks in text streams.
              </p>
              <div className="flex items-center justify-between pt-5 border-t border-black/5 dark:border-white/[0.04] mt-auto">
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-80">
                  TX-04 // TEXT_FORENSICS
                </span>
                <Link href="/tools" className="text-[12px] text-black dark:text-white flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium opacity-0 group-hover:opacity-100">
                  Launch Analyzer <ArrowRight size={12} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Card 3 — Deep Heuristic Scan */}
            <SpotlightCard className="group flex flex-col h-full !p-8 bg-white dark:bg-[#060910] border-black/5 dark:border-white/[0.03]">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/[0.05] border border-purple-500/20 dark:border-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <Search size={22} />
              </div>
              <h3 className="text-[18px] font-bold mb-3 text-black dark:text-white tracking-tight">Deep Heuristic Scan</h3>
              <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-[1.6] mb-8 flex-1">
                Our engine cross-references multiple detection methods to
                minimize false positives and identify even the most subtle
                anomalies.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                {['LSB', 'CHI-SQ', 'BIDI'].map(tag => (
                  <span key={tag} className="text-[9px] font-mono font-bold px-2.5 py-1 rounded bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.05] text-neutral-600 dark:text-neutral-500">
                    {tag}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          🔌 PRODUCT INTEGRATION — Sentinel Prime: Email Guard
          ═══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24 mb-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-0 border border-black/5 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-xl dark:shadow-none">
          
          {/* Left — Description (Dark Green Tint) */}
          <div className="bg-emerald-50/50 dark:bg-[#05100B] p-10 sm:p-14 border-r border-black/5 dark:border-white/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-neon/[0.05] border border-emerald-500/20 dark:border-neon/10 flex items-center justify-center">
                <Mail size={20} className="text-emerald-600 dark:text-neon" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold tracking-tight text-black dark:text-white mb-1">Sentinel Prime: Email Guard</h2>
                <p className="text-[10px] font-mono text-emerald-600 dark:text-neon/60 uppercase tracking-[0.1em]">Browser Extension // v0.1.0</p>
              </div>
            </div>
            <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-[1.7] mb-10">
              Extend your forensic capabilities to your inbox. Our browser
              extension monitors your Gmail stream for hidden payloads,
              protecting you from sophisticated steganographic phishing
              and data leaks in real-time.
            </p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-10">
              {[
                'REAL-TIME GMAIL SCAN',
                'PAYLOAD EXTRACTION',
                'VISUAL WARNINGS',
                'AUTO-SANITIZATION',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-neon" />
                  <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-500 uppercase tracking-wider">{text}</span>
                </div>
              ))}
            </div>

            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white dark:btn-solid-green rounded-full h-11 px-6 text-[13px]">
              <Link href="/downloads/sentinel-prime-extension.zip">
                <Download className="mr-2 h-4 w-4" /> Download Extension
              </Link>
            </Button>
          </div>

          {/* Right — Minimal Terminal UI */}
          <div className="bg-white dark:bg-[#060910] p-10 sm:p-14 flex flex-col justify-center">
            <h3 className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-8">
              Installation Node
            </h3>
            
            <ol className="space-y-6 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
              <li className="flex gap-4">
                <span className="text-neutral-400 dark:text-neutral-600">1</span>
                <span className="leading-relaxed">DOWNLOAD AND EXTRACT THE EXTENSION MODULE.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-neutral-400 dark:text-neutral-600">2</span>
                <span className="leading-relaxed">NAVIGATE TO <span className="text-black dark:text-neutral-300">CHROME://EXTENSIONS</span> IN YOUR BROWSER.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-neutral-400 dark:text-neutral-600">3</span>
                <span className="leading-relaxed">ACTIVATE <span className="text-black dark:text-neutral-300">&quot;DEVELOPER MODE&quot;</span> (TOP-RIGHT TOGGLE).</span>
              </li>
              <li className="flex gap-4">
                <span className="text-neutral-400 dark:text-neutral-600">4</span>
                <span className="leading-relaxed">EXECUTE <span className="text-black dark:text-neutral-300">&quot;LOAD UNPACKED&quot;</span> AND SELECT THE DIRECTORY.</span>
              </li>
            </ol>

            <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/[0.04] text-[10px] font-mono">
              <span className="text-neutral-400 dark:text-neutral-600">&gt; SYSTEM_READY // </span>
              <span className="text-emerald-600 dark:text-neutral-500">SEC_PROTO_MAIL</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
