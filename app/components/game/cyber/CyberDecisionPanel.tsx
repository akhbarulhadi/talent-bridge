"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock, Eye, User, Search, Terminal, KeyRound, FileWarning, ShieldAlert } from "lucide-react";
import type { Decision } from "@/app/types/game";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ICONS = [Lock, Eye, User, Search, Terminal, KeyRound, FileWarning, ShieldAlert];

export default function CyberDecisionPanel({
  decisions,
  disabled,
  onSelect,
}: {
  decisions: Decision[];
  disabled: boolean;
  onSelect: (decision: Decision) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    gsap.fromTo(
      listRef.current.children,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" },
    );
  }, [decisions]);

  // Keyboard shortcuts: A -> decisions[0], B -> decisions[1], etc. Purely
  // index-based, so it works for any number of decisions on any node.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (disabled || event.repeat) return;
      const key = event.key.toUpperCase();
      const index = LETTERS.indexOf(key);
      if (index >= 0 && decisions[index]) {
        onSelect(decisions[index]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [decisions, disabled, onSelect]);

  if (decisions.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-outline/30 bg-surface-container-highest px-4 py-3 text-on-surface-variant">
        <ShieldAlert size={16} />
        <p className="font-[var(--font-body)] text-[14px]">
          No decision available for this situation.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Terminal size={14} className="text-primary" />
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-on-surface">
          Incident Response
        </p>
      </div>
      <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant mb-4">
        What should the analyst do?
      </p>

      <div ref={listRef} className="space-y-2.5">
        {decisions.map((decision, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <button
              key={decision.id}
              disabled={disabled}
              onClick={() => onSelect(decision)}
              className="group w-full flex items-start gap-3 rounded-lg border border-white/10 bg-surface-container-low px-4 py-3.5 text-left transition-all hover:border-tertiary/50 hover:bg-tertiary/5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-tertiary/10 font-[var(--font-mono)] text-[12px] font-bold text-tertiary group-hover:bg-tertiary/20 transition-colors">
                {LETTERS[index] ?? index + 1}
              </span>
              <Icon size={16} className="shrink-0 mt-1.5 text-on-surface-variant" />
              <span className="font-[var(--font-body)] text-[14px] leading-[1.5] text-on-surface pt-0.5">
                {decision.title ?? decision.text ?? "Opsi tanpa judul"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] text-outline-variant mt-3">
        Shortcut: {decisions.map((_, i) => LETTERS[i]).join(" / ")}
      </p>
    </div>
  );
}
