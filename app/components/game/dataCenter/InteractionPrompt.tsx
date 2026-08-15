"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Keyboard } from "lucide-react";
import { STATION_META, type StationId } from "./stationMapping";

export default function InteractionPrompt({
  stationId,
  onInteract,
}: {
  stationId: StationId | null;
  onInteract: () => void;
}) {
  const rootRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      rootRef.current,
      { opacity: 0, y: 16, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.9)" },
    ).to(rootRef.current, {
      boxShadow: "0 0 0 8px rgba(255, 209, 102, 0)",
      repeat: -1,
      yoyo: true,
      duration: 0.9,
      ease: "sine.inOut",
    });
    return () => {
      tl.kill();
    };
  }, [stationId]);

  if (!stationId) return null;
  const meta = STATION_META[stationId];

  return (
    <button
      ref={rootRef}
      onClick={onInteract}
      className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-secondary/50 bg-secondary/15 px-5 py-3 backdrop-blur-md hover:bg-secondary/25 transition-colors"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-on-secondary font-[var(--font-mono)] text-[13px] font-bold">
        E
      </div>
      <div className="leading-tight text-left">
        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold text-secondary flex items-center gap-1">
          <Keyboard size={11} />
          Tekan untuk memeriksa
        </p>
        <p className="font-[var(--font-body)] text-[13px] font-semibold text-on-surface">
          {meta.label}
        </p>
      </div>
    </button>
  );
}
