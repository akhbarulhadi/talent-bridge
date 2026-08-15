import { createClient } from "@/utils/supabase/client";
import type { Decision } from "@/app/types/game";

/**
 * Fetch all decisions (`mst_decision`) available for a given problem
 * statement node, ordered by creation order so options render
 * consistently (A, B, C, D...).
 */
export async function getDecisions(
  problemStatementId: string,
): Promise<Decision[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mst_decision")
    .select("*")
    .eq("problem_statement_id", problemStatementId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getDecisions error:", error);
    throw new Error("No decision available for this situation.");
  }

  return (data as Decision[]) ?? [];
}
