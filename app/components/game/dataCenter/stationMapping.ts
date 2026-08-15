import type { ProblemStatement } from "@/app/types/game";

/**
 * A "station" is a physical spot in the data center room (a rack, a CRAC
 * unit, the NOC terminal, the vendor desk...) that the player must walk to
 * and interact with to reveal the current problem statement.
 *
 * IMPORTANT: this is presentation-only. It never decides game flow — it
 * only picks *where in the room* to point the player for whichever node
 * Supabase says is current. The mapping is a deterministic function of the
 * node's own content/id, so it works for any scenario/problem statement
 * without hardcoding specific UUIDs or branch names anywhere.
 */
export type StationId =
  | "rack-b14"
  | "rack-generic-1"
  | "rack-generic-2"
  | "rack-generic-3"
  | "crac-1"
  | "crac-2"
  | "crac-3"
  | "noc-terminal"
  | "vendor-desk";

export interface StationMeta {
  label: string;
  hint: string;
}

export const STATION_META: Record<StationId, StationMeta> = {
  "rack-b14": { label: "Rack B-14", hint: "Rack dengan suhu tidak normal" },
  "rack-generic-1": { label: "Rack A-05", hint: "Unit server" },
  "rack-generic-2": { label: "Rack C-08", hint: "Unit server" },
  "rack-generic-3": { label: "Rack D-04", hint: "Unit server" },
  "crac-1": { label: "CRAC #1", hint: "Unit pendingin" },
  "crac-2": { label: "CRAC #2", hint: "Unit pendingin" },
  "crac-3": { label: "CRAC #3", hint: "Unit pendingin dengan alarm aktif" },
  "noc-terminal": { label: "Terminal NOC", hint: "Konsol monitoring & dokumentasi" },
  "vendor-desk": { label: "Meja Eskalasi", hint: "Telepon & jalur eskalasi" },
};

const FALLBACK_POOL: StationId[] = [
  "rack-generic-1",
  "rack-generic-2",
  "rack-generic-3",
  "crac-1",
  "crac-2",
];

/** Small stable string hash so the same node always maps to the same station. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministically picks which station in the room represents the given
 * problem statement, using lightweight keyword matching against its own
 * narrative text (falls back to a stable hash so every node always has a
 * target, even generic ones).
 */
export function selectStationForProblem(problem: ProblemStatement): StationId {
  const text = (problem.briefing_awal ?? "").toLowerCase();

  if (text.includes("b-14") || (text.includes("rack") && text.includes("suhu"))) {
    return "rack-b14";
  }
  if (text.includes("crac #3") || text.includes("crac#3") || text.includes("crac 3")) {
    return "crac-3";
  }
  if (text.includes("crac")) {
    return "crac-1";
  }
  if (text.includes("vendor") || text.includes("telepon") || text.includes("eskalasi")) {
    return "vendor-desk";
  }
  if (
    text.includes("laporan") ||
    text.includes("dokumentasi") ||
    text.includes("histori") ||
    text.includes("chat") ||
    text.includes("incident record") ||
    text.includes("monitoring")
  ) {
    return "noc-terminal";
  }

  return FALLBACK_POOL[hashString(problem.id) % FALLBACK_POOL.length];
}
