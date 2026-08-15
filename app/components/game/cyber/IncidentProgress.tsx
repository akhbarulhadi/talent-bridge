"use client";

import { Check } from "lucide-react";
import { INCIDENT_STAGES, type IncidentStage } from "./cyberDerived";

export default function IncidentProgress({ stage }: { stage: IncidentStage }) {
  const currentIndex = INCIDENT_STAGES.indexOf(stage);

  return (
    <div className="shrink-0 border-t border-white/10 bg-[#070a14]/90 backdrop-blur-md px-4 md:px-6 py-3 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max">
        {INCIDENT_STAGES.map((s, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold transition-colors ${
                  isCurrent
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : isDone
                      ? "border-tertiary/40 bg-tertiary/10 text-tertiary"
                      : "border-white/10 text-outline-variant"
                }`}
              >
                {isDone ? <Check size={11} /> : null}
                {s}
              </div>
              {i < INCIDENT_STAGES.length - 1 && (
                <div
                  className={`h-px w-4 md:w-8 ${isDone ? "bg-tertiary/40" : "bg-white/10"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
