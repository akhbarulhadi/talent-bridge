"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Navigation } from "lucide-react";
import type { Navigation as NavigationVector } from "@/app/store/dataCenterInteractionStore";
import { STATION_META, type StationId } from "./stationMapping";

/** Roughly converts world/pixel distance into a friendlier "meter" readout. */
function toMeters(distance: number) {
  return Math.max(1, Math.round(distance / 32));
}

export default function DirectionCompass({
  stationId,
  navigation,
}: {
  stationId: StationId | null;
  navigation: NavigationVector | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 12, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
    );
  }, [stationId]);

  if (!stationId || !navigation) return null;

  const meta = STATION_META[stationId];
  const rotationDeg = (navigation.angle * 180) / Math.PI + 90;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 glass-panel rounded-full px-4 py-2.5"
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary transition-transform duration-150"
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <Navigation size={16} strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold text-outline-variant">
          Menuju &middot; {toMeters(navigation.distance)}m
        </p>
        <p className="font-[var(--font-body)] text-[13px] font-semibold text-on-surface">
          {meta.label}
        </p>
      </div>
    </div>
  );
}
