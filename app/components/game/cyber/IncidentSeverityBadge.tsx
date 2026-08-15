"use client";

import { ShieldAlert } from "lucide-react";
import type { Severity } from "./cyberDerived";

const SEVERITY_STYLE: Record<Severity, string> = {
  LOW: "text-tertiary bg-tertiary/10 border-tertiary/40",
  MEDIUM: "text-secondary bg-secondary/10 border-secondary/40",
  HIGH: "text-error bg-error/10 border-error/40",
  CRITICAL: "text-error bg-error/20 border-error/60 animate-pulse-glow",
};

export default function IncidentSeverityBadge({ severity }: { severity: Severity }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${SEVERITY_STYLE[severity]}`}
    >
      <ShieldAlert size={13} />
      <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold">
        {severity}
      </span>
    </div>
  );
}
