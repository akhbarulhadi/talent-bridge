"use client";

import { ArrowLeft, Terminal } from "lucide-react";
import ScoreDisplay from "../ScoreDisplay";
import IncidentSeverityBadge from "./IncidentSeverityBadge";
import type { Severity } from "./cyberDerived";
import { INCIDENT_DOSSIER } from "./cyberConfig";

export default function SOCHeader({
  severity,
  score,
  onExit,
}: {
  severity: Severity;
  score: number;
  onExit: () => void;
}) {
  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#070a14]/90 backdrop-blur-md px-4 md:px-6 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold">
            Exit
          </span>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={16} className="text-tertiary shrink-0" />
          <span className="font-[var(--font-mono)] text-[13px] md:text-[14px] font-bold tracking-[0.05em] text-on-surface truncate">
            SENTINEL{" "}
            <span className="text-outline-variant">
              {"// SECURITY OPERATIONS CENTER"}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant hidden sm:inline">
          #{INCIDENT_DOSSIER.incidentId}
        </span>
        <IncidentSeverityBadge severity={severity} />
        <ScoreDisplay score={score} />
      </div>
    </div>
  );
}
