import { createClient } from "@/utils/supabase/client";
import type { ProblemStatement } from "@/app/types/game";

/**
 * Fetch a single problem statement node (`mst_problem_statement`) by id.
 */
export async function getProblemStatement(
  id: string,
): Promise<ProblemStatement> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mst_problem_statement")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("getProblemStatement error:", error);
    throw new Error("Problem statement unavailable");
  }

  return data as ProblemStatement;
}
