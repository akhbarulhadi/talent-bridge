"use client";

import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function ErrorPanel({
  message,
  onRetry,
  onExit,
}: {
  message: string;
  onRetry?: () => void;
  onExit: () => void;
}) {
  return (
    <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl border border-error/30 p-6 md:p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 text-error mx-auto mb-4">
        <AlertTriangle size={22} />
      </div>
      <h2 className="font-[var(--font-display)] text-[18px] font-semibold text-on-surface mb-2">
        Terjadi Kendala
      </h2>
      <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant mb-6">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary-gradient flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all"
          >
            <RefreshCcw size={15} />
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
