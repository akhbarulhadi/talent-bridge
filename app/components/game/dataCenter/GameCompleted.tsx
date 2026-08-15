"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Trophy, RotateCcw, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { DecisionHistoryEntry } from "@/app/types/game";
import { getStatusStyle } from "../statusStyles";

export default function GameCompleted({
  scenarioTitle,
  totalScore,
  history,
  isSavingScore,
  scoreSaved,
  saveError,
  onRestart,
  onExit,
}: {
  scenarioTitle: string | null;
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
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    );
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative z-10 w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-6 md:p-8"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
          <Trophy size={26} />
        </div>
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-1">
          Simulasi Selesai
        </p>
        <h1 className="font-[var(--font-display)] text-[24px] font-bold text-on-surface mb-3">
          {scenarioTitle ?? "Skenario"}
        </h1>
        <div className="font-[var(--font-mono)] text-[32px] font-bold text-primary">
          {totalScore > 0 ? `+${totalScore}` : totalScore}
        </div>
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] text-outline-variant">
          Total Score
        </p>

        {/* Score Save Status */}
        {totalScore !== 0 && (
          <div className="mt-4 flex items-center gap-2">
            {isSavingScore && (
              <>
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="font-[var(--font-body)] text-[13px] text-on-surface-variant">
                  Menyimpan skor...
                </span>
              </>
            )}
            {scoreSaved && !isSavingScore && (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="font-[var(--font-body)] text-[13px] text-green-500">
                  Skor berhasil disimpan ke profil
                </span>
              </>
            )}
            {saveError && !isSavingScore && (
              <>
                <AlertCircle size={16} className="text-red-500" />
                <span className="font-[var(--font-body)] text-[13px] text-red-500">
                  {saveError}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mb-6">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3">
            Decision Timeline
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto hide-scrollbar">
            {history.map((entry, index) => {
              const style = getStatusStyle(entry.status);
              return (
                <div
                  key={`${entry.decisionId}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-container-low px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-[var(--font-mono)] text-[11px] font-bold text-outline-variant">
                      {index + 1}.
                    </span>
                    <span className="font-[var(--font-body)] text-[13px] text-on-surface truncate">
                      {entry.decisionTitle ?? "Keputusan"}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 font-[var(--font-mono)] text-[12px] font-bold ${style.text}`}
                  >
                    {entry.score > 0 ? `+${entry.score}` : entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>
        <button
          onClick={onRestart}
          className="btn-primary-gradient flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RotateCcw size={15} />
          Ulangi
        </button>
      </div>
    </div>
  );
}
