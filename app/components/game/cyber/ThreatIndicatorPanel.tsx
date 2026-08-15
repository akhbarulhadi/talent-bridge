"use client";

import { Globe, Clock, User, KeyRound, FileWarning, ShieldAlert } from "lucide-react";
import { INCIDENT_DOSSIER, type ThreatLevel } from "./cyberConfig";

const ICONS = [Globe, Clock, User, KeyRound, FileWarning];

const LEVEL_STYLE: Record<ThreatLevel, string> = {
  HIGH: "text-error",
  MEDIUM: "text-secondary",
  LOW: "text-tertiary",
};

export default function ThreatIndicatorPanel() {
  return (
    <div className="glass-panel rounded-xl p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={15} className="text-error" />
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-on-surface">
          Threat Indicators
        </p>
      </div>
      <div className="space-y-2.5">
        {INCIDENT_DOSSIER.threatIndicators.map((indicator, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={indicator.label} className="flex items-center gap-2.5">
              <Icon size={14} className={`shrink-0 ${LEVEL_STYLE[indicator.level]}`} />
              <span className="font-[var(--font-body)] text-[13px] text-on-surface-variant flex-1">
                {indicator.label}
              </span>
              <span
                className={`font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold ${LEVEL_STYLE[indicator.level]}`}
              >
                {indicator.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
