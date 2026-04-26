'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Hourglass, CheckCircle2 } from 'lucide-react';

const STAGES = [
  'VALIDATION',
  'ZERO-WIDTH',
  'HOMOGLYPH',
  'EMOJI',
  'STATISTICAL',
  'AI/ML',
  'SCORING'
];

interface Props {
  isScanning: boolean;
}

export default function DetectionPipelineAnimation({ isScanning }: Props) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (isScanning) {
      setActiveStage(0);
      
      const interval = setInterval(() => {
        setActiveStage((prev) => {
          if (prev >= STAGES.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Fast-forward to completion when not scanning (e.g. when results are shown)
      setActiveStage(STAGES.length);
    }
  }, [isScanning]);

  const progress = Math.min((activeStage / (STAGES.length - 1)) * 100, 100);

  return (
    <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl w-full">
      <h3 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-6">Real-Time Detection Pipeline</h3>
      
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-4 left-[5%] right-[5%] h-[2px] bg-white/[0.05]" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-4 left-[5%] h-[2px] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-300 ease-linear"
          style={{ width: `${(progress * 0.9)}%` }} // Adjust for the 5% padding on both sides
        />

        <div className="flex justify-between relative z-10">
          {STAGES.map((stage, index) => {
            const isCompleted = activeStage > index;
            const isActive = activeStage === index;

            return (
              <div key={stage} className="flex flex-col items-center gap-3">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 bg-[#0d1117]",
                    isCompleted ? "border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                    isActive ? "border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse" :
                    "border-white/10 text-neutral-600"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Hourglass size={14} className={cn(isActive && "animate-[spin_3s_linear_infinite]")} />
                  )}
                </div>
                <span 
                  className={cn(
                    "text-[8px] sm:text-[9px] font-mono uppercase tracking-wider transition-colors duration-300",
                    isCompleted ? "text-neutral-300" :
                    isActive ? "text-cyan-400" :
                    "text-neutral-600"
                  )}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
