"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronRight, ShieldCheck, ShieldAlert, Siren, HelpCircle } from "lucide-react";
import type { Decision } from "@/app/types/game";
import { useCyberFxStore } from "@/app/store/cyberFxStore";

const TEMPLATES: Record<
  string,
  { headline: string; subline: string; icon: typeof ShieldCheck; tone: string }
> = {
  success: {
    headline: "CONTAINMENT SUCCESSFUL",
    subline: "Threat activity reduced.",
    icon: ShieldCheck,
    tone: "border-tertiary/40 bg-tertiary/10 text-tertiary",
  },
  warning: {
    headline: "RISK INCREASED",
    subline: "The attacker may still have access.",
    icon: ShieldAlert,
    tone: "border-secondary/40 bg-secondary/10 text-secondary",
  },
  critical: {
    headline: "INCIDENT ESCALATED",
    subline: "Unauthorized activity has progressed.",
    icon: Siren,
    tone: "border-error/40 bg-error/10 text-error",
  },
};

const FALLBACK_TEMPLATE = {
  headline: "ACTION RECORDED",
  subline: "Analyst response logged.",
  icon: HelpCircle,
  tone: "border-outline/30 bg-surface-container-highest text-on-surface-variant",
};

export default function CyberConsequencePanel({
  decision,
  onContinue,
  isLoading,
}: {
  decision: Decision;
  onContinue: () => void;
  isLoading: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const status = (decision.status ?? "").toLowerCase();
  const template = TEMPLATES[status] ?? FALLBACK_TEMPLATE;
  const Icon = template.icon;
  const score = decision.skor ?? 0;

  useEffect(() => {
    useCyberFxStore.getState().triggerPulse(decision.status);

    if (!rootRef.current) return;
    if (status === "critical") {
      gsap.fromTo(
        rootRef.current,
        { x: -6 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" },
      );
    } else {
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision.id]);

  return (
    <div ref={rootRef}>
      <div className={`rounded-xl border ${template.tone} p-4 mb-5`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/20">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-[var(--font-mono)] text-[15px] font-bold tracking-[0.03em]">
              {template.headline}
            </h3>
            <p className="font-[var(--font-body)] text-[13px] opacity-90">{template.subline}</p>
          </div>
        </div>

        {decision.konsekuensi && (
          <p className="font-[var(--font-body)] text-[13px] leading-[1.5] text-on-surface border-t border-white/10 pt-3 mt-1">
            {decision.konsekuensi}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold opacity-70">
            Score Impact
          </p>
          <span className="font-[var(--font-mono)] text-[14px] font-bold">
            {score > 0 ? `+${score}` : score}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={isLoading}
          className="group flex items-center gap-2 rounded-lg bg-tertiary px-5 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-tertiary hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
        >
          {isLoading ? "Processing..." : "Continue Investigation"}
          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
