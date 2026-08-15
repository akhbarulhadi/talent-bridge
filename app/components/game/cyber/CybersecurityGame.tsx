"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Siren, ChevronRight } from "lucide-react";

import { useGameStore } from "@/app/store/gameStore";
import ProblemStatementPanel from "../ProblemStatementPanel";
import ErrorPanel from "../ErrorPanel";
import SOCHeader from "./SOCHeader";
import IncidentProgress from "./IncidentProgress";
import ThreatIndicatorPanel from "./ThreatIndicatorPanel";
import AccountStatusPanel from "./AccountStatusPanel";
import AuthenticationTimeline from "./AuthenticationTimeline";
import CyberDecisionPanel from "./CyberDecisionPanel";
import CyberConsequencePanel from "./CyberConsequencePanel";
import CyberGameCompleted from "./CyberGameCompleted";
import CyberSplash from "./CyberSplash";
import {
  deriveAccountStatus,
  deriveIncidentStage,
  deriveSeverity,
  buildTimeline,
} from "./cyberDerived";

const PhaserSOCGame = dynamic(() => import("./PhaserSOCGame"), { ssr: false });

/**
 * The Cybersecurity Analyst presentation: a SOC incident-response console.
 * No room to walk around in — the analyst is at a workstation. Every node
 * reveals investigation context (alert, timeline, threat indicators)
 * first, then the incident-response decision panel, matching real
 * analyst workflow: read before you act.
 *
 * All scenario/decision data comes from the reusable `useGameStore`
 * engine. This component only derives cosmetic SOC state (severity,
 * account status, incident stage, timeline) from generic signals already
 * exposed by that engine (history length/status, total score) — never
 * from a specific node id or label.
 */
export default function CybersecurityGame({
  scenarioId,
  onExit,
}: {
  scenarioId: string;
  onExit: () => void;
}) {
  const {
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
    selectDecision,
    continueAfterDecision,
    loadScenario,
    resetGame,
  } = useGameStore();

  const [showSplash, setShowSplash] = useState(true);
  const [stage, setStage] = useState<"investigation" | "decision">(
    "investigation",
  );

  // Reset to the investigation stage whenever a new node loads. Adjusting
  // state directly during render (comparing against the previous node id)
  // instead of in a useEffect avoids an extra render pass — this is the
  // pattern React itself recommends for "resetting state when a prop
  // changes": https://react.dev/learn/you-might-not-need-an-effect
  const lastProblemIdRef = useRef<string | undefined>(undefined);
  if (currentProblemStatement?.id !== lastProblemIdRef.current) {
    lastProblemIdRef.current = currentProblemStatement?.id;
    if (stage !== "investigation") setStage("investigation");
  }

  const handleExit = () => {
    resetGame();
    onExit();
  };

  const handleRestart = () => {
    setShowSplash(true);
    setStage("investigation");
    resetGame();
    loadScenario(scenarioId);
  };

  const severity = deriveSeverity(totalScore, isGameCompleted, decisionHistory);
  const accountStatus = deriveAccountStatus(decisionHistory);
  const incidentStage = deriveIncidentStage(
    decisionHistory.length,
    isGameCompleted,
  );
  const timeline = buildTimeline(decisionHistory);

  const showBlockingOverlay =
    !!error || isGameCompleted || (isLoading && !currentProblemStatement);

  return (
    <div className="fixed inset-0 bg-[#070a14] flex flex-col overflow-hidden">
      <PhaserSOCGame />
      <div className="absolute inset-0 bg-[#050810]/55" />

      <div className="relative z-10 flex flex-col h-full">
        <SOCHeader severity={severity} score={totalScore} onExit={handleExit} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 md:gap-6">
            <div className="flex flex-col gap-4 order-2 lg:order-1">
              <ThreatIndicatorPanel />
              <AccountStatusPanel status={accountStatus} />
            </div>

            <div className="flex flex-col gap-4 order-1 lg:order-2">
              {currentProblemStatement && (
                <div className="glass-panel rounded-xl p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Siren size={15} className="text-error" />
                    <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-on-surface">
                      Security Alert
                    </p>
                  </div>
                  <ProblemStatementPanel problem={currentProblemStatement} />
                  <AuthenticationTimeline entries={timeline} />
                </div>
              )}

              {currentProblemStatement && (
                <div className="glass-panel rounded-xl p-5 md:p-6">
                  {selectedDecision ? (
                    <CyberConsequencePanel
                      decision={selectedDecision}
                      onContinue={continueAfterDecision}
                      isLoading={isLoading}
                    />
                  ) : stage === "investigation" ? (
                    <div className="flex flex-col items-center text-center gap-3 py-2">
                      <p className="font-[var(--font-body)] text-[13px] text-on-surface-variant max-w-sm">
                        Review the alert, authentication timeline, and threat
                        indicators above before deciding how to respond.
                      </p>
                      <button
                        onClick={() => setStage("decision")}
                        className="group flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/40 px-5 py-2.5 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold text-primary hover:bg-primary/25 transition-colors"
                      >
                        Proceed to Incident Response
                        <ChevronRight
                          size={15}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  ) : (
                    <CyberDecisionPanel
                      decisions={availableDecisions}
                      disabled={isLoading}
                      onSelect={selectDecision}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <IncidentProgress stage={incidentStage} />
      </div>

      {showSplash && !error && (
        <CyberSplash onBegin={() => setShowSplash(false)} />
      )}

      {showBlockingOverlay && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-[#050810]/85 backdrop-blur-sm">
          {error ? (
            <ErrorPanel
              message={error}
              onRetry={() => loadScenario(scenarioId)}
              onExit={handleExit}
            />
          ) : isGameCompleted ? (
            <CyberGameCompleted
              totalScore={totalScore}
              history={decisionHistory}
              isSavingScore={isSavingScore}
              scoreSaved={scoreSaved}
              saveError={error}
              onRestart={handleRestart}
              onExit={handleExit}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-tertiary" size={40} />
              <p className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                Loading incident state...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
