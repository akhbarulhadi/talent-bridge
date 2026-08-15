"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import ProblemBriefing from "@/app/components/game/ProblemBriefing";
import GameHUD from "@/app/components/game/GameHUD";
import { useGameStore } from "@/app/store/gameStore";
import {
  DEFAULT_PROBLEM_STATEMENT,
  type ProblemStatement,
} from "@/app/components/game/types";

const PhaserGame = dynamic(() => import("@/app/components/game/PhaserGame"), {
  ssr: false,
});

export default function ProblemSimulationPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  const router = useRouter();

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);

  const [problem, setProblem] = useState<ProblemStatement>(
    DEFAULT_PROBLEM_STATEMENT,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resetGame();

    const fetchProblem = async () => {
      try {
        const res = await fetch(`/api/problem?problemId=${problemId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const cleaned = Object.fromEntries(
              Object.entries(data).filter(
                ([, value]) => value !== undefined && value !== null,
              ),
            );
            setProblem({ ...DEFAULT_PROBLEM_STATEMENT, ...cleaned });
          }
        }
      } catch (error) {
        console.error(
          "Gagal mengambil problem statement, menggunakan skenario default:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const handleStartSimulation = () => {
    setPhase("entering");
    window.setTimeout(() => setPhase("playing"), 700);
  };

  const handleExit = () => {
    resetGame();
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-[var(--font-mono)] text-[13px] tracking-[0.05em] text-on-surface-variant">
            Memuat skenario...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "briefing") {
    return (
      <ProblemBriefing problem={problem} onStart={handleStartSimulation} />
    );
  }

  if (phase === "entering") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-[var(--font-mono)] text-[13px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
            Memasuki Ruang Data Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#05070f]">
      <PhaserGame />
      <GameHUD onExit={handleExit} />
    </div>
  );
}
