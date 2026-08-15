"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ArrowLeft, Server, Loader2 } from "lucide-react";

import { useGameStore } from "@/app/store/gameStore";
import { useDataCenterInteraction } from "@/app/store/dataCenterInteractionStore";
import ProblemStatementPanel from "../ProblemStatementPanel";
import ScoreDisplay from "../ScoreDisplay";
import ErrorPanel from "../ErrorPanel";
import DecisionPanel from "./DecisionPanel";
import ConsequencePanel from "./ConsequencePanel";
import GameCompleted from "./GameCompleted";
import DirectionCompass from "./DirectionCompass";
import InteractionPrompt from "./InteractionPrompt";
import IncidentAlertToast from "./IncidentAlertToast";

const PhaserGame = dynamic(() => import("./PhaserGame"), { ssr: false });

/**
 * The Data Center Technician presentation: a top-down server room the
 * player walks around in Phaser, with problem statements gated behind
 * physically walking to the flagged rack/CRAC/terminal and pressing E.
 *
 * All scenario/decision data comes from the reusable `useGameStore` engine.
 * `useDataCenterInteraction` is this presentation's own store, purely for
 * the walk-and-interact mechanic — it never touches Supabase.
 */
export default function DataCenterGame({
  scenarioId,
  onExit,
}: {
  scenarioId: string;
  onExit: () => void;
}) {
  const {
    scenarioTitle,
    titleName,
    currentProblemStatement,
    availableDecisions,
    totalScore,
    selectedDecision,
    decisionHistory,
    isLoading,
    isGameCompleted,
    isSavingScore,
    scoreSaved,
    error,
    loadScenario,
    selectDecision,
    continueAfterDecision,
    resetGame,
  } = useGameStore();

  const {
    activeStationId,
    isNearStation,
    navigation,
    isPanelOpen,
    syncToProblemStatement,
    openPanel,
    reset: resetInteraction,
  } = useDataCenterInteraction();

  const panelRef = useRef<HTMLDivElement>(null);

  // Whenever the core engine moves to a new node, re-target the room and
  // hide the panel — the player has to go find & interact with it again.
  useEffect(() => {
    syncToProblemStatement(currentProblemStatement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblemStatement?.id]);

  // "E to interact" — global so it works regardless of canvas focus.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key.toLowerCase() === "e") {
        const core = useGameStore.getState();
        const canOpen =
          !!core.currentProblemStatement &&
          !core.isLoading &&
          !core.isGameCompleted;
        useDataCenterInteraction.getState().openPanel(canOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!panelRef.current || !isPanelOpen || !currentProblemStatement) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblemStatement?.id, selectedDecision?.id, isPanelOpen]);

  const handleInteract = () => {
    const canOpen = !!currentProblemStatement && !isLoading && !isGameCompleted;
    openPanel(canOpen);
  };

  const handleRestart = () => {
    resetGame();
    resetInteraction();
    loadScenario(scenarioId);
  };

  const handleExit = () => {
    resetGame();
    resetInteraction();
    onExit();
  };

  const showModal =
    !!error ||
    isGameCompleted ||
    (isLoading && !currentProblemStatement) ||
    (isPanelOpen && !!currentProblemStatement);

  const showExploration =
    !error && !isGameCompleted && !!currentProblemStatement && !isPanelOpen;

  return (
    <div className="fixed inset-0 bg-[#05070f]">
      <PhaserGame />

      {/* Vignette atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 45%, rgba(5,7,15,0.65) 100%)",
        }}
      />

      {/* Top bar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 p-4 md:p-6">
        <button
          onClick={handleExit}
          className="pointer-events-auto glass-panel flex items-center gap-2 rounded-lg px-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold">
            Exit
          </span>
        </button>

        <div className="pointer-events-auto glass-panel hidden md:flex items-center gap-2 rounded-lg px-4 py-2 max-w-md">
          <Server size={15} className="text-primary shrink-0" />
          <span className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-on-surface truncate">
            {titleName ?? "Data Center Technician"}
            {scenarioTitle ? ` — ${scenarioTitle}` : ""}
          </span>
        </div>

        <div className="pointer-events-auto">
          <ScoreDisplay score={totalScore} />
        </div>
      </div>

      {/* Modal-style overlays: loading / error / completed / decision panel */}
      {showModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
          {error ? (
            <ErrorPanel
              message={error}
              onRetry={() => loadScenario(scenarioId)}
              onExit={handleExit}
            />
          ) : isGameCompleted ? (
            <GameCompleted
              scenarioTitle={scenarioTitle}
              totalScore={totalScore}
              history={decisionHistory}
              isSavingScore={isSavingScore}
              scoreSaved={scoreSaved}
              saveError={error}
              onRestart={handleRestart}
              onExit={handleExit}
            />
          ) : isLoading && !currentProblemStatement ? (
            <div className="pointer-events-auto flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                Loading scenario...
              </p>
            </div>
          ) : isPanelOpen && currentProblemStatement ? (
            <div
              ref={panelRef}
              className="pointer-events-auto w-full max-w-xl glass-panel rounded-2xl border border-white/10 p-6 md:p-8 max-h-[85vh] overflow-y-auto hide-scrollbar"
            >
              <ProblemStatementPanel problem={currentProblemStatement} />

              {selectedDecision ? (
                <ConsequencePanel
                  decision={selectedDecision}
                  onContinue={continueAfterDecision}
                  isLoading={isLoading}
                />
              ) : (
                <DecisionPanel
                  decisions={availableDecisions}
                  disabled={isLoading}
                  onSelect={selectDecision}
                />
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Exploration overlays: guide the player to the current problem spot */}
      {showExploration && (
        <>
          <IncidentAlertToast show={decisionHistory.length === 0} />
          {isNearStation ? (
            <InteractionPrompt
              stationId={activeStationId}
              onInteract={handleInteract}
            />
          ) : (
            <DirectionCompass
              stationId={activeStationId}
              navigation={navigation}
            />
          )}
        </>
      )}
    </div>
  );
}
