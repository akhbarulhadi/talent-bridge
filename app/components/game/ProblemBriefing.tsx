"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Server,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Radio,
} from "lucide-react";

import type { ProblemStatement } from "./types";

const toneStyles: Record<string, string> = {
  warning: "border-secondary/40 bg-secondary/10 text-secondary",
  danger: "border-error/40 bg-error/10 text-error",
};

export default function ProblemBriefing({
  problem,
  onStart,
}: {
  problem: ProblemStatement;
  onStart: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const narrativeRef = useRef<HTMLParagraphElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const objectivesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(badgeRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.15")
      .fromTo(titleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.3")
      .fromTo(
        alertsRef.current?.children ?? [],
        { opacity: 0, y: 12, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.1 },
        "-=0.3"
      )
      .fromTo(narrativeRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
      .fromTo(
        objectivesRef.current?.children ?? [],
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 },
        "-=0.25"
      )
      .fromTo(ctaRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.1");

    return () => {
      tl.kill();
    };
  }, [problem.id]);

  const handleStart = () => {
    if (!rootRef.current) {
      onStart();
      return;
    }
    gsap.to(rootRef.current, {
      opacity: 0,
      scale: 1.02,
      duration: 0.45,
      ease: "power2.in",
      onComplete: onStart,
    });
  };

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen w-full overflow-y-auto bg-background flex items-center justify-center p-6 md:p-10"
    >
      {/* Ambient background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(192,193,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(192,193,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(128,131,255,0.12), transparent 55%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl glass-panel rounded-2xl p-6 md:p-10 border border-white/10">
        <div ref={badgeRef} className="flex items-center gap-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Server size={18} />
          </div>
          <span className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-primary">
            {problem.roleTitle} — Incident Briefing
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-[var(--font-display)] text-[26px] md:text-[32px] leading-[1.25] font-bold text-on-surface mb-5"
        >
          {problem.incidentTitle}
        </h1>

        <div ref={alertsRef} className="flex flex-wrap gap-3 mb-6">
          {problem.alerts.map((alert) => (
            <div
              key={alert.label}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${toneStyles[alert.tone]}`}
            >
              {alert.tone === "danger" ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
              <div>
                <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold leading-none mb-0.5 opacity-80">
                  {alert.label}
                </p>
                <p className="font-[var(--font-mono)] text-[13px] font-bold leading-none">{alert.value}</p>
              </div>
            </div>
          ))}
        </div>

        <p
          ref={narrativeRef}
          className="font-[var(--font-body)] text-[15px] leading-[1.7] text-on-surface-variant mb-7"
        >
          {problem.narrative}
        </p>

        <div className="mb-8">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3 flex items-center gap-2">
            <Radio size={13} />
            Prinsip Penanganan
          </p>
          <div ref={objectivesRef} className="space-y-2.5">
            {problem.objectives.map((objective) => (
              <div key={objective} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-tertiary mt-0.5 shrink-0" />
                <p className="font-[var(--font-body)] text-[14px] leading-[1.5] text-on-surface">
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div ref={ctaRef} className="flex justify-end">
          <button
            onClick={handleStart}
            className="btn-primary-gradient group flex items-center gap-2 rounded-lg px-6 py-3 font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all"
          >
            Masuk ke Ruang Server
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
