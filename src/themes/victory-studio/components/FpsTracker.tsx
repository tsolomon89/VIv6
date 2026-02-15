import React, { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, Layers } from 'lucide-react';
import { performanceStats } from '../utils/performance';

interface FpsTrackerProps {
  className?: string;
}

export const FpsTracker: React.FC<FpsTrackerProps> = ({ className = "" }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [stats, setStats] = useState({ ctx: 0, raf: 0 });

  useEffect(() => {
    let frameCount = 0;
    let prevTime = performance.now();
    let rafId: number;

    const tick = () => {
      const time = performance.now();
      frameCount++;
      
      // Update every 500ms
      if (time >= prevTime + 500) {
        if (ref.current) {
            const fps = Math.round((frameCount * 1000) / (time - prevTime));
            ref.current.textContent = fps.toString();
            
            if (fps < 30) ref.current.style.color = '#ef4444';
            else if (fps < 55) ref.current.style.color = '#eab308';
            else ref.current.style.color = '#22c55e';
        }
        
        // Sync stats
        setStats({
            ctx: performanceStats.activeContexts,
            raf: performanceStats.activeRafs
        });

        frameCount = 0;
        prevTime = time;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className={`pointer-events-none select-none flex flex-col gap-2 ${className}`}>
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm ring-1 ring-white/5">
        <Activity className="w-3.5 h-3.5 text-white/40" />
        <div className="flex items-baseline gap-1.5">
            <span ref={ref} className="text-sm font-mono font-bold text-green-500 tabular-nums leading-none">--</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">FPS</span>
        </div>
      </div>
      
      <div className="flex gap-2">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Layers className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-mono font-bold text-white/60">{stats.ctx} CTX</span>
          </div>
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Cpu className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-mono font-bold text-white/60">{stats.raf} RAF</span>
          </div>
      </div>
    </div>
  );
};