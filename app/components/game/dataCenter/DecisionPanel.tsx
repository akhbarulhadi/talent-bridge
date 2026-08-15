"use client";

import { HelpCircle } from "lucide-react";
import type { Decision } from "@/app/types/game";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function DecisionPanel({
  decisions,
  disabled,
  onSelect,
}: {
  decisions: Decision[];
  disabled: boolean;
  onSelect: (decision: Decision) => void;
}) {
  if (decisions.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-outline/30 bg-surface-container-highest px-4 py-3 text-on-surface-variant">
        <HelpCircle size={16} />
        <p className="font-[var(--font-body)] text-[14px]">
          No decision available for this situation.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3">
        What will you do?
      </p>
      <div className="space-y-2.5">
        {decisions.map((decision, index) => (
          <button
            key={decision.id}
            disabled={disabled}
            onClick={() => onSelect(decision)}
            className="decision-btn group w-full flex items-start gap-3 rounded-lg border border-white/10 bg-surface-container-low px-4 py-3.5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 font-[var(--font-mono)] text-[12px] font-bold text-primary group-hover:bg-primary/25 transition-colors">
              {LETTERS[index] ?? index + 1}
            </span>
            <span className="font-[var(--font-body)] text-[14px] leading-[1.5] text-on-surface pt-0.5">
              {decision.title ?? decision.text ?? "Opsi tanpa judul"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
