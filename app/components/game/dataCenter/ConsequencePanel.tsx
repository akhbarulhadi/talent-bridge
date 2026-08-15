"use client";

import { ChevronRight } from "lucide-react";
import type { Decision } from "@/app/types/game";
import { getStatusStyle } from "../statusStyles";

export default function ConsequencePanel({
  decision,
  onContinue,
  isLoading,
}: {
  decision: Decision;
  onContinue: () => void;
  isLoading: boolean;
}) {
  const style = getStatusStyle(decision.status);
  const StatusIcon = style.icon;
  const score = decision.skor ?? 0;

  return (
    <div>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3">
        Decision Result
      </p>

      <div className={`rounded-xl border ${style.border} ${style.bg} p-4 mb-5`}>
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
          >
            <StatusIcon size={18} />
          </div>
          <div>
            <h3 className="font-[var(--font-display)] text-[15px] font-semibold text-on-surface mb-0.5">
              {decision.title ?? decision.text}
            </h3>
            <span
              className={`font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold ${style.text}`}
            >
              {style.label}
            </span>
          </div>
        </div>

        {decision.konsekuensi && (
          <div className="mb-3">
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-1">
              Consequence
            </p>
            <p className="font-[var(--font-body)] text-[14px] leading-[1.5] text-on-surface">
              {decision.konsekuensi}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold text-outline-variant">
            Score
          </p>
          <span
            className={`font-[var(--font-mono)] text-[14px] font-bold ${style.text}`}
          >
            {score > 0 ? `+${score}` : score}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={isLoading}
          className="btn-primary-gradient group flex items-center gap-2 rounded-lg px-5 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
        >
          {isLoading ? "Memuat..." : "Continue"}
          <ChevronRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
}
