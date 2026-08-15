"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Siren, ChevronRight } from "lucide-react";
import { INCIDENT_DOSSIER } from "./cyberConfig";

export default function CyberSplash({ onBegin }: { onBegin: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }).fromTo(
      rootRef.current.querySelectorAll(".splash-row"),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
      "-=0.1",
    );
  }, []);

  const handleBegin = () => {
    if (!rootRef.current) {
      onBegin();
      return;
    }
    gsap.to(rootRef.current, {
      opacity: 0,
      scale: 1.02,
      duration: 0.35,
      ease: "power2.in",
      onComplete: onBegin,
    });
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#050810]/95 backdrop-blur-sm p-6"
    >
      <div className="w-full max-w-md rounded-2xl border border-error/40 bg-[#0a0f1f] p-6 md:p-8 shadow-[0_0_60px_rgba(255,77,77,0.15)]">
        <div className="splash-row flex items-center gap-3 mb-5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-error" />
          </span>
          <Siren size={18} className="text-error" />
          <h1 className="font-[var(--font-mono)] text-[15px] font-bold tracking-[0.05em] text-error">
            SECURITY INCIDENT DETECTED
          </h1>
        </div>

        <dl className="space-y-3 mb-6">
          <div className="splash-row">
            <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
              Incident
            </dt>
            <dd className="font-[var(--font-body)] text-[15px] font-semibold text-on-surface">
              Suspicious Login &amp; Potential Breach
            </dd>
          </div>
          <div className="splash-row flex gap-8">
            <div>
              <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
                Severity
              </dt>
              <dd className="font-[var(--font-mono)] text-[14px] font-bold text-error">HIGH</dd>
            </div>
            <div>
              <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
                Target
              </dt>
              <dd className="font-[var(--font-mono)] text-[14px] font-bold text-on-surface">
                ADMIN ACCOUNT
              </dd>
            </div>
          </div>
          <div className="splash-row flex gap-8">
            <div>
              <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
                Detection Time
              </dt>
              <dd className="font-[var(--font-mono)] text-[14px] text-on-surface">
                {INCIDENT_DOSSIER.loginTime}
              </dd>
            </div>
            <div>
              <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
                Source
              </dt>
              <dd className="font-[var(--font-mono)] text-[14px] text-on-surface">Foreign IP</dd>
            </div>
          </div>
          <div className="splash-row">
            <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant">
              Activity
            </dt>
            <dd className="font-[var(--font-body)] text-[14px] text-on-surface">
              Configuration file access attempt
            </dd>
          </div>
        </dl>

        <div className="splash-row flex items-center justify-between rounded-lg border border-error/30 bg-error/10 px-3 py-2 mb-6">
          <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-error">
            Status
          </span>
          <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-error">
            Active Incident
          </span>
        </div>

        <button
          onClick={handleBegin}
          className="splash-row w-full flex items-center justify-center gap-2 rounded-lg bg-error px-5 py-3 font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-white hover:scale-[1.01] active:scale-95 transition-all"
        >
          Begin Investigation
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
