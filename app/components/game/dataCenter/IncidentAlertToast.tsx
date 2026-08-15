"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Siren } from "lucide-react";

export default function IncidentAlertToast({ show }: { show: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !rootRef.current) return;
    const tl = gsap.timeline({ delay: 0.6 });
    tl.fromTo(
      rootRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    ).to(rootRef.current, { opacity: 0, y: -10, duration: 0.5, ease: "power2.in", delay: 4.5 });

    return () => {
      tl.kill();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-xl border border-error/40 bg-error/10 backdrop-blur-md px-4 py-3 max-w-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error/20 text-error">
        <Siren size={18} />
      </div>
      <p className="font-[var(--font-body)] text-[13px] leading-[1.4] text-on-surface">
        Alarm terdeteksi di ruang data center. Ikuti arah kompas, datangi lokasi bertanda kuning,
        lalu tekan <span className="font-bold text-secondary">[E]</span> untuk memeriksa.
      </p>
    </div>
  );
}
