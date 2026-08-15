"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CheckCircle2, ShieldCheck, RotateCcw, LogOut, Loader2, AlertCircle } from "lucide-react";
import type { DecisionHistoryEntry } from "@/app/types/game";

const OUTCOME_CHECKLIST = [
  "Account contained",
  "IoC identified",
  "Preventive action defined",
  "MFA enforcement recommended",
  "Incident report completed",
];

export default function CyberGameCompleted({
  totalScore,
  history,
  isSavingScore,
  scoreSaved,
  saveError,
  onRestart,
  onExit,
}: {
  totalScore: number;
  history: DecisionHistoryEntry[];
  isSavingScore?: boolean;
  scoreSaved?: boolean;
  saveError?: string | null;
  onRestart: () => void;
  onExit: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      rootRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    ).fromTo(
      rootRef.current.querySelectorAll(".checklist-item"),
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.1 },
      "-=0.2",
    );
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative z-10 w-full max-w-lg glass-panel rounded-2xl border border-tertiary/30 p-6 md:p-8"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/15 text-tertiary mb-4">
          <ShieldCheck size={28} />
        </div>
        <h1 className="font-[var(--font-mono)] text-[20px] font-bold tracking-[0.05em] text-tertiary mb-1">
          INCIDENT CLOSED
        </h1>
        <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant">
          Threat contained successfully.
        </p>
      </div>

      <div className="mb-6">
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3">
          Security Outcome
        </p>
        <div className="space-y-2">
          {OUTCOME_CHECKLIST.map((item) => (
            <div key={item} className="checklist-item flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-tertiary shrink-0" />
              <span className="font-[var(--font-body)] text-[14px] text-on-surface">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 text-center rounded-xl border border-white/10 bg-surface-container-low py-4">
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-1">
          Final Score
        </p>
        <p className="font-[var(--font-mono)] text-[32px] font-bold text-tertiary">
          {totalScore > 0 ? `+${totalScore}` : totalScore}
        </p>
        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant mt-1">
          {history.length} decisions logged
        </p>

        {/* Score Save Status */}
        {totalScore !== 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {isSavingScore && (
              <>
                <Loader2 size={16} className="animate-spin text-tertiary" />
                <span className="font-[var(--font-body)] text-[13px] text-on-surface-variant">
                  Saving score...
                </span>
              </>
            )}
            {scoreSaved && !isSavingScore && (
              <>
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="font-[var(--font-body)] text-[13px] text-green-500">
                  Score saved to profile
                </span>
              </>
            )}
            {saveError && !isSavingScore && (
              <>
                <AlertCircle size={16} className="text-red-500" />
                <span className="font-[var(--font-body)] text-[12px] text-red-500">
                  {saveError}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
        >
          <RotateCcw size={15} />
          Replay
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-tertiary px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-tertiary hover:scale-[1.02] active:scale-95 transition-all"
        >
          <LogOut size={15} />
          Complete Incident
        </button>
      </div>
    </div>
  );
}
