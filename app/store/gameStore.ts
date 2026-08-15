import { create } from "zustand";

import { getScenario } from "@/app/services/game/scenario.service";
import { getProblemStatement } from "@/app/services/game/problemStatement.service";
import { getDecisions } from "@/app/services/game/decision.service";
import { updateProfileScore } from "@/app/services/game/profile.service";
import type {
  Decision,
  DecisionHistoryEntry,
  ProblemStatement,
} from "@/app/types/game";

/**
 * REUSABLE decision-tree game engine.
 *
 * This store is intentionally presentation-agnostic: it knows nothing about
 * server rooms, SOC dashboards, racks, or CRAC units. It only tracks the
 * data-driven scenario/problem-statement/decision graph exactly as it
 * exists in Supabase.
 *
 * Any scenario (Data Center Technician, Cybersecurity Analyst, NOC
 * Operator, etc.) uses this same store. Presentation-specific concerns
 * (e.g. the Data Center's "walk to a station" mechanic) live in their own
 * dedicated store/hook and react to changes here — they never get mixed
 * into this file. See `app/store/dataCenterInteractionStore.ts` for an
 * example of that pattern.
 */
interface GameState {
  scenarioId: string | null;
  scenarioTitle: string | null;
  /** `mst_title.name` — used only to pick a presentation, never for branching. */
  titleName: string | null;

  currentProblemStatement: ProblemStatement | null;
  availableDecisions: Decision[];

  totalScore: number;
  selectedDecision: Decision | null;
  decisionHistory: DecisionHistoryEntry[];

  isLoading: boolean;
  isGameCompleted: boolean;
  isSavingScore: boolean;
  scoreSaved: boolean;
  error: string | null;

  /** Loads a scenario by id, then loads its start_problem_statement_id node. */
  loadScenario: (scenarioId: string) => Promise<void>;
  /** Loads a problem statement node plus every decision attached to it. */
  loadProblemStatement: (problemStatementId: string) => Promise<void>;
  /** Locks in the player's choice, applies its score, and records history. */
  selectDecision: (decision: Decision) => void;
  /**
   * Called after the consequence screen — follows
   * `selectedDecision.next_problem_statement_id`. If it's null, the game
   * is complete (terminal node); otherwise the next node is loaded.
   */
  continueAfterDecision: () => Promise<void>;

  resetGame: () => void;
}

const initialState = {
  scenarioId: null as string | null,
  scenarioTitle: null as string | null,
  titleName: null as string | null,
  currentProblemStatement: null as ProblemStatement | null,
  availableDecisions: [] as Decision[],
  totalScore: 0,
  selectedDecision: null as Decision | null,
  decisionHistory: [] as DecisionHistoryEntry[],
  isLoading: false,
  isGameCompleted: false,
  isSavingScore: false,
  scoreSaved: false,
  error: null as string | null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  loadScenario: async (scenarioId) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null, isGameCompleted: false });

    try {
      const scenario = await getScenario(scenarioId);

      if (!scenario.start_problem_statement_id) {
        set({
          error:
            "This scenario does not have a starting point yet (start_problem_statement_id).",
          isLoading: false,
        });
        return;
      }

      set({
        scenarioId: scenario.id,
        scenarioTitle: scenario.skenario,
        titleName: scenario.titleName ?? null,
        totalScore: 0,
        decisionHistory: [],
        selectedDecision: null,
      });

      await get().loadProblemStatement(scenario.start_problem_statement_id);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Scenario not found",
        isLoading: false,
      });
    }
  },

  loadProblemStatement: async (problemStatementId) => {
    set({ isLoading: true, error: null });

    try {
      const [problemStatement, decisions] = await Promise.all([
        getProblemStatement(problemStatementId),
        getDecisions(problemStatementId),
      ]);

      set({
        currentProblemStatement: problemStatement,
        availableDecisions: decisions,
        selectedDecision: null,
        isLoading: false,
      });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Problem statement unavailable",
        isLoading: false,
      });
    }
  },

  selectDecision: (decision) => {
    const state = get();

    // Double-click / double-submit protection: ignore if a request is in
    // flight, or a decision for this node has already been locked in.
    if (state.isLoading || state.selectedDecision) return;

    const historyEntry: DecisionHistoryEntry = {
      problemStatementId: state.currentProblemStatement?.id ?? "",
      decisionId: decision.id,
      decisionTitle: decision.title,
      score: decision.skor ?? 0,
      status: decision.status,
    };

    set({
      selectedDecision: decision,
      totalScore: state.totalScore + (decision.skor ?? 0),
      decisionHistory: [...state.decisionHistory, historyEntry],
    });
  },

  continueAfterDecision: async () => {
    const decision = get().selectedDecision;
    if (!decision) return;

    const nextProblemStatementId = decision.next_problem_statement_id;

    if (!nextProblemStatementId) {
      // Terminal node — no `if (node === "TKx")` anywhere, this is purely
      // data-driven: a null FK means the branch has ended.
      console.log('[GameStore] 🎯 Game completed! Terminal node reached.');
      set({ isGameCompleted: true });
      
      // Save score to profile
      const totalScore = get().totalScore;
      const isSavingScore = get().isSavingScore;
      const scoreSaved = get().scoreSaved;
      
      console.log('[GameStore] Total score:', totalScore);
      console.log('[GameStore] Already saving?', isSavingScore);
      console.log('[GameStore] Already saved?', scoreSaved);
      
      // PROTECTION: Only save once!
      if (totalScore !== 0 && !isSavingScore && !scoreSaved) {
        console.log('[GameStore] Saving score to profile...');
        set({ isSavingScore: true });
        try {
          const result = await updateProfileScore(totalScore);
          console.log('[GameStore] ✅ Score saved successfully:', result);
          set({ isSavingScore: false, scoreSaved: true });
        } catch (error) {
          console.error("[GameStore] ❌ Failed to save score:", error);
          set({ 
            isSavingScore: false, 
            error: "Score cannot be saved. Please try again." 
          });
        }
      } else if (scoreSaved) {
        console.log('[GameStore] ⚠️ Score already saved, skipping.');
      } else if (totalScore === 0) {
        console.log('[GameStore] ⚠️ Score is 0, skipping save.');
      }
      
      return;
    }

    await get().loadProblemStatement(nextProblemStatementId);
  },

  resetGame: () => set({ ...initialState }),
}));
