"use client";

import { AlertOctagon } from "lucide-react";
import type { ProblemStatement } from "@/app/types/game";

export default function ProblemStatementPanel({ problem }: { problem: ProblemStatement }) {
  return (
    <div className="mb-6">
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-outline-variant mb-3 flex items-center gap-2">
        <AlertOctagon size={13} />
        Problem
      </p>
      <p className="font-[var(--font-body)] text-[15px] leading-[1.7] text-on-surface-variant whitespace-pre-line">
        {problem.briefing_awal ?? "Briefing tidak tersedia untuk situasi ini."}
      </p>
    </div>
  );
}
