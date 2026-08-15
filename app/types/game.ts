/**
 * Domain types mirroring the Supabase master-data schema used by the
 * dynamic branching decision-tree game engine.
 *
 * These tables are the single source of truth for every scenario's flow.
 * Nothing about the tree shape (nodes, branches, terminal points) should
 * ever be hardcoded in the frontend — it is all derived from
 * `mst_decision.next_problem_statement_id`.
 */

export interface Scenario {
  id: string;
  id_title: string | null;
  skenario: string | null;
  tingkat_kesulitan: string | null;
  estimasi_durasi: number | null;
  start_problem_statement_id: string | null;
  created_at?: string;
  /**
   * Joined from `mst_title.name`. Used purely to select which presentation
   * (Phaser scene + UI) to render for a scenario — never for decision
   * logic. See `scenarioPresentation.tsx`.
   */
  titleName?: string | null;
}

export interface ProblemStatement {
  id: string;
  briefing_awal: string | null;
  created_at: string;
}

/**
 * Known status values used for visual styling. Any other string value
 * must still be handled gracefully (see `getStatusStyle` fallback).
 */
export type DecisionStatus =
  "success" | "warning" | "critical" | "neutral" | string | null;

export interface Decision {
  id: string;
  problem_statement_id: string | null;
  title: string | null;
  text: string | null;
  konsekuensi: string | null;
  status: DecisionStatus;
  skor: number | null;
  next_problem_statement_id: string | null;
  created_at: string;
}

export interface DecisionHistoryEntry {
  problemStatementId: string;
  decisionId: string;
  decisionTitle: string | null;
  score: number;
  status: DecisionStatus;
}
