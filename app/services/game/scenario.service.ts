import { createClient } from "@/utils/supabase/client";
import type { Scenario } from "@/app/types/game";

/**
 * Fetch a single scenario (`mst_skenario`) by id, joined with its title
 * name (`mst_title.name`). The title name is only ever used to pick which
 * presentation (UI + Phaser scene) to render — see `scenarioPresentation.tsx`.
 * It never participates in decision-tree branching logic.
 *
 * Throws a friendly error if the scenario doesn't exist so the caller
 * (Zustand store) can surface it to the UI.
 */
export async function getScenario(scenarioId: string): Promise<Scenario> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mst_skenario")
    .select("*, mst_title(name)")
    .eq("id", scenarioId)
    .single();

  if (error || !data) {
    if (error) console.error("getScenario error:", error);
    throw new Error("Scenario not found");
  }

  const { mst_title, ...scenario } = data as Scenario & {
    mst_title?: { name: string | null } | null;
  };

  return {
    ...scenario,
    titleName: mst_title?.name ?? null,
  };
}
