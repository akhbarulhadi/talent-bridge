"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowLeft,
  Target,
  AlertTriangle,
  ShieldAlert,
  Info,
  Keyboard,
} from "lucide-react";

import { useGameStore, HOTSPOTS } from "@/app/store/gameStore";

const statusStyles: Record<string, { border: string; bg: string; text: string; icon: typeof AlertTriangle }> = {
  warning: {
    border: "border-secondary/40",
    bg: "bg-secondary/10",
    text: "text-secondary",
    icon: AlertTriangle,
  },
  danger: {
    border: "border-error/40",
    bg: "bg-error/10",
    text: "text-error",
    icon: ShieldAlert,
  },
  info: {
    border: "border-tertiary/40",
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    icon: Info,
  },
};

export default function GameHUD({ onExit }: { onExit: () => void }) {
  const objectiveText = useGameStore((s) => s.objectiveText);
  const nearbyHotspotId = useGameStore((s) => s.nearbyHotspotId);

  const topBarRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topBarRef.current) {
      gsap.fromTo(
        topBarRef.current,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3 }
      );
    }
    if (hintRef.current) {
      gsap.fromTo(
        hintRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.5 }
      );
    }
  }, []);

  useEffect(() => {
    if (!tooltipRef.current) return;
    if (nearbyHotspotId) {
      gsap.fromTo(
        tooltipRef.current,
        { opacity: 0, scale: 0.9, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.7)" }
      );
    } else {
      gsap.to(tooltipRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.25, ease: "power2.in" });
    }
  }, [nearbyHotspotId]);

  const hotspot = nearbyHotspotId ? HOTSPOTS[nearbyHotspotId] : null;
  const style = hotspot ? statusStyles[hotspot.status] : null;
  const HotspotIcon = style?.icon ?? Info;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Vignette + scanline atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 45%, rgba(5,7,15,0.65) 100%)",
        }}
      />

      {/* Top objective bar */}
      <div
        ref={topBarRef}
        className="pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-between gap-4 p-4 md:p-6"
      >
        <button
          onClick={onExit}
          className="glass-panel flex items-center gap-2 rounded-lg px-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold">
            Keluar
          </span>
        </button>

        <div className="glass-panel flex items-center gap-3 rounded-lg px-4 py-2.5 max-w-md">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Target size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold text-outline-variant leading-none mb-1">
              Objektif
            </p>
            <p className="font-[var(--font-body)] text-[13px] leading-[1.3] text-on-surface truncate">
              {objectiveText}
            </p>
          </div>
        </div>

        <div className="hidden md:flex glass-panel items-center gap-2 rounded-lg px-3 py-2 text-error">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
          </span>
          <span className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold">
            CRAC #3 Alarm
          </span>
        </div>
      </div>

      {/* Hotspot tooltip */}
      {hotspot && style && (
        <div
          ref={tooltipRef}
          className={`pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 w-[min(90vw,420px)] glass-panel rounded-xl border ${style.border} ${style.bg} p-4`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
              <HotspotIcon size={18} />
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-[15px] font-semibold text-on-surface mb-1">
                {hotspot.title}
              </h3>
              <p className="font-[var(--font-body)] text-[13px] leading-[1.4] text-on-surface-variant">
                {hotspot.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Movement hint */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 glass-panel rounded-full px-4 py-2 text-outline-variant"
      >
        <Keyboard size={14} />
        <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-medium">
          WASD / Arrow Keys untuk bergerak
        </span>
      </div>
    </div>
  );
}
