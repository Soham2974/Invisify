import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Shield, Eye, Lock, Globe, Zap, Cpu, Search, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const metadata = {
  title: 'About Us | Invisify Systems',
  description: 'Securing the Invisible Layer. We uncover what traditional tools fail to see.',
};

export default function AboutPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      
      {/* HERO SECTION - Large Card */}
      <div className="glass-card p-10 md:p-16 relative overflow-hidden group glossy-dark">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-neon/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/10 dark:group-hover:bg-neon/10 transition-colors duration-500" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-neon/[0.03] border border-emerald-500/20 dark:border-neon/20 text-emerald-600 dark:text-neon text-[10px] font-bold tracking-widest uppercase mb-6">
            Mission & Vision
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Securing the <span className="text-emerald-600 dark:text-neon">Invisible</span> Layer
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">
            Invisify is a cybersecurity intelligence platform focused on detecting hidden, obfuscated, and steganographic threats across modern digital systems. We uncover what traditional tools fail to see.
          </p>
        </div>
      </div>

      {/* GRID - Who We Are & The Problem */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* WHO WE ARE */}
        <div className="glass-card p-8 space-y-6 glossy-dark">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-neon">
            <Globe size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Who We Are</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              We are a team of cybersecurity engineers, researchers, and system architects dedicated to solving one of the most overlooked problems in digital security — hidden data channels.
            </p>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              From zero-width Unicode exploits to image-based payload injection and emoji steganography, our mission is to expose covert attack vectors that bypass conventional detection systems.
            </p>
          </div>
        </div>

        {/* THE MODERN THREAT LANDSCAPE */}
        <div className="glass-card p-8 space-y-6 glossy-dark">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Activity size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">The Modern Threat Landscape</h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
            Attackers are no longer relying on visible exploits alone. Modern threats are embedded within:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Zero-width characters',
              'Encoded image payloads',
              'Emoji steganography',
              'Covert text streams'
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs font-medium text-slate-700 dark:text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-500 italic">
            These techniques evade firewalls and antivirus engines — creating a silent attack surface across enterprise infrastructure.
          </p>
        </div>
      </div>

      {/* WHAT WE DO - Full Width Card */}
      <div className="glass-card p-8 md:p-12 glossy-dark">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">What We Do</h2>
            <p className="text-base text-slate-600 dark:text-neutral-400 leading-relaxed">
              Invisify provides a multi-layered detection engine designed to analyze and neutralize hidden data threats in real time. Our platform combines sophisticated analysis techniques to identify invisible payloads without disrupting system performance.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Statistical Anomaly', icon: Zap, color: 'text-amber-500' },
                { label: 'Entropy Analysis', icon: Cpu, color: 'text-purple-500' },
                { label: 'Machine Learning', icon: Search, color: 'text-cyan-500' },
                { label: 'Content Inspection', icon: Shield, color: 'text-emerald-500' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex flex-col gap-2">
                  <item.icon size={20} className={item.color} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square max-w-sm mx-auto w-full hidden lg:block">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent blur-3xl rounded-full" />
             <div className="absolute inset-4 border border-white/[0.05] rounded-[40px] flex items-center justify-center">
                <div className="p-4 rounded-[30px] dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center">
                   <Image src="/logo.png" alt="Invisify Logo" width={280} height={280} className="object-contain" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* CORE PRINCIPLES - Triple Card Row */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white px-2">Core Principles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-8 space-y-4 hover:border-emerald-500/30 transition-colors glossy-dark">
            <Eye size={32} className="text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Absolute Visibility</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              Every byte, pixel, and Unicode character is analyzed — nothing is ignored.
            </p>
          </div>
          <div className="glass-card p-8 space-y-4 hover:border-emerald-500/30 transition-colors glossy-dark">
            <Shield size={32} className="text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zero-Trust Forensics</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              All inputs are treated as potentially malicious until verified through layered analysis.
            </p>
          </div>
          <div className="glass-card p-8 space-y-4 hover:border-emerald-500/30 transition-colors glossy-dark">
            <Lock size={32} className="text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy-First Architecture</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              All processing occurs in-memory. No user data is stored, logged, or exposed.
            </p>
          </div>
        </div>
      </div>

      {/* TECHNOLOGY & USE CASES - Card Duo */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* OUR TECHNOLOGY */}
        <div className="glass-card p-8 space-y-6 glossy-dark">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Our Technology</h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400">Invisify is powered by a modular detection architecture:</p>
          <div className="space-y-4">
            {[
              { title: 'Sentinel Engine', desc: 'Core scanning and threat detection' },
              { title: 'Invisify Analyzer', desc: 'Steganography and hidden data extraction' },
              { title: 'Signal Processing Layer', desc: 'Entropy and statistical validation' },
              { title: 'AI Models', desc: 'Behavioral pattern recognition' },
            ].map((tech) => (
              <div key={tech.title} className="flex gap-4 items-start group">
                <div className="w-1.5 h-8 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-emerald-500 transition-colors" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tech.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-500">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHERE WE'RE USED */}
        <div className="glass-card p-8 space-y-6 glossy-dark">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Where We're Used</h2>
          <div className="grid gap-3">
            {[
              'Enterprise security monitoring',
              'Threat intelligence platforms',
              'Secure communication validation',
              'Digital forensics investigations',
              'Cloud and API payload inspection'
            ].map((useCase) => (
              <div key={useCase} className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-neon/5 border border-emerald-500/10 dark:border-neon/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-neon" />
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VISION & EXISTS - Simple Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.05] glossy-dark">
          <h3 className="text-[10px] font-mono text-emerald-600 dark:text-neon uppercase tracking-widest mb-3">Why Invisify Exists</h3>
          <p className="text-lg font-bold text-slate-800 dark:text-white">Traditional security tools focus on known threats. We focus on hidden ones.</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.05] glossy-dark">
          <h3 className="text-[10px] font-mono text-emerald-600 dark:text-neon uppercase tracking-widest mb-3">Our Vision</h3>
          <p className="text-lg font-bold text-slate-800 dark:text-white">To build a world where no data can hide malicious intent.</p>
        </div>
      </div>

      {/* CTA - Final Large Card */}
      <div className="glass-card p-10 md:p-16 text-center space-y-8 relative overflow-hidden glossy-dark">
        <div className="absolute inset-0 bg-emerald-500/[0.02] dark:bg-neon/[0.02]" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Ready to secure what others can't detect?</h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-neutral-400">
            Deploy Invisify across your infrastructure and gain visibility into hidden attack vectors before they become breaches.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white dark:btn-glow-green rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/20 w-full sm:w-auto">
              <Link href="/soc/scanner">
                Launch Deep Scan <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-base font-bold w-full sm:w-auto border-slate-300 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
              <a href="https://github.com/Soham2974/Invisify" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" /> View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
