"use client";

import { CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react";
import type { TimelineSeed } from "./cyberConfig";

const TONE_ICON: Record<TimelineSeed["tone"], typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  neutral: Circle,
};

const TONE_COLOR: Record<TimelineSeed["tone"], string> = {
  success: "text-tertiary",
  warning: "text-secondary",
  critical: "text-error",
  neutral: "text-outline-variant",
};

export default function AuthenticationTimeline({ entries }: { entries: TimelineSeed[] }) {
  return (
    <div className="mt-5 pt-4 border-t border-white/10">
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3">
        Authentication Timeline
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
        {entries.map((entry, i) => {
          const Icon = TONE_ICON[entry.tone];
          return (
            <div key={`${entry.time}-${i}`} className="flex items-center gap-3">
              <span className="font-[var(--font-mono)] text-[11px] text-outline-variant w-10 shrink-0">
                {entry.time}
              </span>
              <Icon size={13} className={`shrink-0 ${TONE_COLOR[entry.tone]}`} />
              <span className="font-[var(--font-body)] text-[13px] text-on-surface-variant">
                {entry.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
