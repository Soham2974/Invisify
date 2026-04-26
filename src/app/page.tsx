import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DecryptedText from '@/components/app/decrypted-text';
import { StegoShieldLogo } from '@/components/app/icons';
import { 
  ArrowRight, ShieldCheck, Eye, Search, Mail, Download, 
  CheckCircle2, AlertTriangle, Shield, Fingerprint, Image as ImageIcon,
  BarChart3, Zap, Lock, Code, BookOpen, Layers, Target, Activity, Smile
} from 'lucide-react';
import SpotlightCard from '@/components/app/spotlight-card';
import { BentoGrid } from '@/components/app/bento-grid';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-emerald-500/30 font-body">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 bg-grid-white pointer-events-none opacity-20" />

      {/* 🧭 HERO SECTION */}
      <section className="relative z-10 pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-8 animate-fade-in uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <ShieldCheck size={14} className="mr-1" />
            <span>Advanced Steganography Detection</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
            Uncover What <br />
            <span className="text-emerald-500 inline-block mt-2">
              <DecryptedText
                text="Others Can’t See"
                speed={50}
                maxIterations={15}
                animateOn="view"
                revealDirection="center"
                className="text-emerald-500"
                encryptedClassName="text-emerald-500/50"
              />
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed font-medium">
            INVISIFY is a next-generation cybersecurity platform that detects hidden data embedded in digital content. From invisible Unicode characters to image-based steganography, our system reveals threats that traditional tools miss.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-black transition-all font-bold rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] scale-100 hover:scale-105">
              <Link href="/scan">
                <RocketIcon className="mr-2 h-5 w-5" /> Start Scan 
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-sm transition-all hover:border-white/20">
              <Link href="/detection-methods">
                <BookOpen className="mr-2 h-5 w-5" /> Explore Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 🏢 ABOUT INVISIFY & 🎯 WHY IT EXISTS */}
      <section className="relative z-10 px-6 py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">The Invisible Threat Layer</h2>
                <p className="text-neutral-400 text-lg leading-relaxed">
                  INVISIFY (Sentinel Prime) is a cybersecurity platform built to detect covert data hiding techniques used in modern attacks. Today’s threats are no longer visible.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest">Attackers hide payloads inside:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Eye, text: "Invisible characters" },
                    { icon: Smile, text: "Emoji sequences" },
                    { icon: ImageIcon, text: "Images & Media" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div className="text-neutral-500"><item.icon size={18} /></div>
                      <span className="font-medium text-neutral-200">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SpotlightCard className="p-8 bg-black/50 border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
                    <Target className="text-rose-500" /> Why INVISIFY Exists
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                    Traditional security tools focus only on visible content. But advanced adversaries use steganography to bypass filters, hide malicious intent, and exfiltrate data silently.
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-100/80 font-medium">
                    INVISIFY brings forensic-level visibility into this hidden layer. <span className="text-emerald-400 font-bold">We detect what others ignore.</span>
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ⚙️ HOW IT WORKS */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Multi-Layer Detection Pipeline</h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">A comprehensive, phase-based approach to analyzing and decoding steganographic threats in real-time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Phase 1 */}
            <SpotlightCard className="flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent border-white/10 group">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Search size={28} />
              </div>
              <h3 className="text-sm font-mono text-blue-400 mb-2">PHASE 1</h3>
              <h4 className="text-2xl font-bold mb-4">Content Identification</h4>
              <p className="text-neutral-400 mb-6">Automatically routes and classifies inputs for specialized processing.</p>
              <div className="mt-auto space-y-2">
                {['Plain Text', 'Unicode / Emoji', 'Image & Media'].map(item => (
                  <div key={item} className="text-xs font-mono px-3 py-2 bg-black/40 rounded-lg border border-white/5">{item}</div>
                ))}
              </div>
            </SpotlightCard>

            {/* Phase 2 */}
            <SpotlightCard className="flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent border-white/10 group">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-sm font-mono text-purple-400 mb-2">PHASE 2</h3>
              <h4 className="text-2xl font-bold mb-4">Deep Analysis</h4>
              <p className="text-neutral-400 mb-6">Cross-references statistical anomalies with AI-driven contextual evaluation.</p>
              <div className="mt-auto space-y-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-neutral-500">RULE-BASED</div>
                  <div className="text-xs px-2 py-1 bg-white/5 rounded">Zero-width & BIDI</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-neutral-500">STATISTICAL</div>
                  <div className="text-xs px-2 py-1 bg-white/5 rounded">Entropy & LSB</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-neutral-500">AI AGENT</div>
                  <div className="text-xs px-2 py-1 bg-white/5 rounded">Intent & Context</div>
                </div>
              </div>
            </SpotlightCard>

            {/* Phase 3 */}
            <SpotlightCard className="flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent border-white/10 group">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-sm font-mono text-amber-400 mb-2">PHASE 3</h3>
              <h4 className="text-2xl font-bold mb-4">Risk Scoring</h4>
              <p className="text-neutral-400 mb-6">Aggregates all signals into a clear, unified risk index with severity reporting.</p>
              <div className="mt-auto p-4 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-mono text-neutral-500">SCORE</span>
                  <span className="text-3xl font-black text-rose-500">92</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-[92%]" />
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 🧠 DETECTION CAPABILITIES (Bento Grid) */}
      <section className="relative z-10 px-6 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Detection Capabilities</h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">A unified engine capable of handling multiple distinct threat vectors simultaneously.</p>
          </div>

          <BentoGrid className="max-w-7xl mx-auto">
            {/* Text Forensics */}
            <SpotlightCard className="flex flex-col justify-between group h-[300px]">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Code size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Text Forensics</h3>
                  <p className="text-sm text-neutral-400">Detect hidden and manipulated text: zero-width characters, homoglyph phishing, and invisible formatting attacks.</p>
                </div>
              </div>
            </SpotlightCard>

            {/* Emoji Analysis */}
            <SpotlightCard className="flex flex-col justify-between group h-[300px]">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Smile size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Emoji Analysis</h3>
                  <p className="text-sm text-neutral-400">Uncover encoded messages: pattern detection, ZWJ sequence anomalies, and obscure encoding identification.</p>
                </div>
              </div>
            </SpotlightCard>

            {/* Image LSB - Span 2 */}
            <SpotlightCard className="md:col-span-2 flex flex-col justify-between group h-[300px]">
              <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="flex-1 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Image Analysis</h3>
                    <p className="text-neutral-400 leading-relaxed mb-4">Reveal hidden data inside images using deep bit-level inspection. We scan for LSB (Least Significant Bit) steganography, structural variance, and deeply embedded metadata payloads.</p>
                  </div>
                </div>
                <div className="flex-1 relative rounded-2xl bg-black/50 border border-white/5 overflow-hidden p-6 flex flex-col justify-center">
                   <div className="space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center"><span className="text-neutral-500">LSB_VARIANCE</span><span className="text-emerald-400">NOMINAL</span></div>
                      <div className="w-full h-1 bg-white/10 rounded-full"><div className="w-[15%] h-full bg-emerald-500 rounded-full"/></div>
                      
                      <div className="flex justify-between items-center"><span className="text-neutral-500">CHI_SQUARE</span><span className="text-rose-400">ANOMALOUS</span></div>
                      <div className="w-full h-1 bg-white/10 rounded-full"><div className="w-[94%] h-full bg-rose-500 rounded-full"/></div>
                   </div>
                </div>
              </div>
            </SpotlightCard>

            {/* AI Intelligence - Span 2 */}
            <SpotlightCard className="md:col-span-2 flex flex-row items-center justify-between group bg-purple-500/5 border-purple-500/20">
               <div className="space-y-2 max-w-md">
                 <div className="flex items-center gap-2 text-purple-400 mb-2 font-mono text-[10px] tracking-widest uppercase">
                    <Zap size={14} /> AI Intelligence
                 </div>
                 <h3 className="text-2xl font-bold tracking-tight">Understand intent beyond patterns.</h3>
                 <p className="text-neutral-400 text-sm">Advanced semantic anomaly detection and context-based risk evaluation provided by the Genkit framework.</p>
               </div>
               <div className="hidden md:flex h-16 w-16 rounded-full bg-purple-500/20 items-center justify-center text-purple-400 animate-pulse">
                 <Fingerprint size={32} />
               </div>
            </SpotlightCard>
          </BentoGrid>
        </div>
      </section>

      {/* 📊 RISK SCORING SYSTEM & ⚡ REAL-TIME */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
             <h2 className="text-3xl font-bold tracking-tight">Risk Scoring System</h2>
             <p className="text-neutral-400">Every scan aggregates detection signals, statistical anomalies, and AI insights into a unified security score.</p>
             
             <div className="space-y-3">
               {[
                 { range: "0–20", label: "Safe", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                 { range: "21–50", label: "Low Risk", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
                 { range: "51–75", label: "Suspicious", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
                 { range: "76–100", label: "High Risk", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
               ].map((score, i) => (
                 <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${score.color}`}>
                   <span className="font-bold text-lg">{score.label}</span>
                   <span className="font-mono">{score.range}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-8">
             <h2 className="text-3xl font-bold tracking-tight">High-Speed Execution</h2>
             <p className="text-neutral-400">INVISIFY is optimized for scale and speed, executing complex heuristics in milliseconds.</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <Zap className="text-amber-400 mb-3" size={24} />
                  <div className="font-bold mb-1">Instant</div>
                  <div className="text-sm text-neutral-500">Text & Emoji Analysis</div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <ImageIcon className="text-blue-400 mb-3" size={24} />
                  <div className="font-bold mb-1">Efficient</div>
                  <div className="text-sm text-neutral-500">Image Scanning</div>
                </div>
                <div className="col-span-2 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold mb-1 text-emerald-400">Real-time Extension</div>
                    <div className="text-sm text-neutral-400">Browser-level Gmail protection</div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                     <Link href="/downloads/sentinel-prime-extension.zip">Get Plugin</Link>
                  </Button>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 🚀 USE CASES & LIMITATIONS */}
      <section className="relative z-10 px-6 py-24 bg-black border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="text-blue-400" /> Use Cases & Privacy
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Email Security', 'Digital Forensics', 'Malware Analysis', 'Content Moderation', 'AI Prompt Security'].map(text => (
                  <div key={text} className="flex items-center gap-2 text-sm text-neutral-300">
                     <CheckCircle2 size={16} className="text-emerald-500" /> {text}
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 flex items-start gap-4">
                <Lock className="text-neutral-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Privacy First Storage</h4>
                  <p className="text-xs text-neutral-500">Your data is not permanently stored. All analysis is performed securely and designed with privacy-first principles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="text-amber-500" /> Transparency
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              We believe in transparency. INVISIFY focuses on text, emoji, and image steganography, using advanced techniques. However, it may not detect extremely low-density or highly advanced hiding methods. We are continuously improving.
            </p>
            
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-4">Future Roadmap</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-neutral-300"><span className="text-purple-400">✦</span> Advanced AI detection models</li>
                <li className="flex gap-3 text-sm text-neutral-300"><span className="text-purple-400">✦</span> Audio & video detection</li>
                <li className="flex gap-3 text-sm text-neutral-300"><span className="text-purple-400">✦</span> Enterprise API access</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 🏆 BOTTOM CTA */}
      <section className="relative z-10 px-6 py-32 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-8">
           <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
             It doesn’t just scan content.<br/>It understands hidden threats.
           </h2>
           <p className="text-neutral-500 text-lg">Developed as a cybersecurity innovation project focused on real-time steganography detection and AI-assisted analysis.</p>
           
           <div className="pt-8">
             <Button asChild size="lg" className="h-14 px-10 bg-white text-black hover:bg-neutral-200 transition-all font-bold rounded-full text-lg shadow-2xl shadow-white/10">
               <Link href="/scan">
                 Experience Sentinel Prime
               </Link>
             </Button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <StegoShieldLogo className="w-8 h-8" />
            <span className="font-bold tracking-tight">INVISIFY</span>
          </div>
          <div className="text-neutral-500 text-sm">
            © 2024 Invisify Security Project. Forensic-grade steganography detection.
          </div>
        </div>
      </footer>
    </div>
  );
}

function RocketIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 3.82-13.01c.21-.3.51-.5.85-.56.34-.05.69.04.97.24a2.18 2.18 0 0 1 1 1.76c0 1.21.32 2.45 1.05 3.39 1.13 1.45 3.03 2.13 4.88 2.13h.11c.42 0 .8.2 1.03.54s.24.77.05 1.1A22 22 0 0 1 15 12c-1.25.01-2.43-.45-3.35-1.28A6.67 6.67 0 0 0 12 15Z"/><path d="M11 9L8 12"/><path d="M15 13L12 16"/><path d="M12 9h.01"/><path d="M16 12h.01"/></svg>
  );
}
