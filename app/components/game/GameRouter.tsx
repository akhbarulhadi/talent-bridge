"use client";

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

import { useGameStore } from "@/app/store/gameStore";
import { getPresentationForTitle } from "./scenarioPresentation";
import ErrorPanel from "./ErrorPanel";

/**
 * Single entry point for any scenario. Loads the scenario via the
 * reusable engine, then hands off to whichever presentation matches its
 * title (see `scenarioPresentation.tsx`). This is the only place that
 * calls `loadScenario` — presentation components just read the
 * already-populated store.
 */
export default function GameRouter({
  scenarioId,
  onExit,
}: {
  scenarioId: string;
  onExit: () => void;
}) {
  const { titleName, error, loadScenario, resetGame } = useGameStore();

  useEffect(() => {
    loadScenario(scenarioId);
    return () => {
      resetGame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // `getPresentationForTitle` always resolves to one of a small, fixed set
  // of stable, module-level-imported components (see
  // `scenarioPresentation.tsx`). This is a legitimate config-driven
  // presentation registry, not a dynamically constructed component.
  // eslint-disable-next-line react-hooks/static-components
  const Presentation = useMemo(
    () => getPresentationForTitle(titleName),
    [titleName],
  );

  if (error && !titleName) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <ErrorPanel
          message={error}
          onRetry={() => loadScenario(scenarioId)}
          onExit={onExit}
        />
      </div>
    );
  }

  if (!titleName) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
            Memuat skenario...
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/static-components
  return <Presentation scenarioId={scenarioId} onExit={onExit} />;
}
