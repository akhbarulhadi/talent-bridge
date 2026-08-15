"use client";

import { useEffect, useRef } from "react";
import MaterialIcon from "../ui/MaterialIcon";

export default function HeroRankCard() {
  const xpBarRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger XP bar animation after mount
    const timer = setTimeout(() => {
      if (xpBarRef.current) {
        xpBarRef.current.style.width = "75%";
      }
      if (sparkleRef.current) {
        sparkleRef.current.style.left = "75%";
        sparkleRef.current.style.opacity = "0.2";
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden animate-stagger">
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          {/* Gold III Badge Hexagon */}
          <div className="w-24 h-24 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffddb8] via-[#ffb95f] to-[#ee9800] rounded-xl rotate-45 transform group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(255,185,95,0.3)] border-2 border-white/20 animate-badge-float" />
            <span className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-surface-container-lowest font-bold relative z-10 -rotate-45">
              III
            </span>
          </div>

          <div>
            {/* LCP Element — name is likely LCP text */}
            <h1 className="font-[var(--font-display)] text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-on-surface mb-1">
              Alex Rivera
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Grade: Gold III
              </span>
              <div className="flex items-center gap-1 text-error bg-error/10 px-3 py-1 rounded-full border border-error/20">
                <MaterialIcon
                  name="local_fire_department"
                  filled
                  size="16px"
                />
                <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-bold">
                  14 Day Streak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Area */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          <div className="flex justify-between font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase text-on-surface-variant">
            <span>Level Progress</span>
            <span className="text-secondary">75%</span>
          </div>
          <div className="h-4 bg-surface-container-lowest rounded-full border border-white/5 overflow-hidden relative">
            {/* XP bar fill — animated via useEffect */}
            <div
              ref={xpBarRef}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary w-0 rounded-full shadow-[0_0_10px_rgba(255,185,95,0.5)] transition-[width] duration-[1.5s] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            />
            {/* Sparkle highlight */}
            <div
              ref={sparkleRef}
              className="absolute top-0 h-full w-6 bg-white/40 blur-[3px] left-0 transition-all duration-[1.5s] ease-out"
            />
          </div>
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs text-outline-variant text-right mt-1">
            250 XP to Platinum
          </p>
        </div>
      </div>
    </div>
  );
}
