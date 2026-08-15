import type { DecisionHistoryEntry } from "@/app/types/game";
import { INCIDENT_DOSSIER, type TimelineSeed } from "./cyberConfig";

/**
 * Pure, presentation-only derivations for the SOC dashboard. Every
 * function here reads only *generic* signals already provided by the
 * reusable engine (`decisionHistory.length`, `decision.status`,
 * `totalScore`) — never a specific problem-statement UUID or node label.
 * That keeps this scenario's "flavor" reactive without smuggling any
 * hardcoded branching logic in through the back door.
 */

export type IncidentStage =
  | "DETECTED"
  | "CONTAINMENT"
  | "INVESTIGATION"
  | "REMEDIATION"
  | "CLOSED";

export type AccountStatus = "ACTIVE" | "SUSPICIOUS" | "ISOLATED" | "LOCKED";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const INCIDENT_STAGES: IncidentStage[] = [
  "DETECTED",
  "CONTAINMENT",
  "INVESTIGATION",
  "REMEDIATION",
  "CLOSED",
];

export function deriveIncidentStage(
  historyLength: number,
  isCompleted: boolean,
): IncidentStage {
  if (isCompleted) return "CLOSED";
  if (historyLength <= 0) return "DETECTED";
  if (historyLength === 1) return "CONTAINMENT";
  if (historyLength === 2) return "INVESTIGATION";
  return "REMEDIATION";
}

function lastStatus(history: DecisionHistoryEntry[]): string {
  if (history.length === 0) return "";
  return (history[history.length - 1].status ?? "").toLowerCase();
}

export function deriveAccountStatus(history: DecisionHistoryEntry[]): AccountStatus {
  if (history.length === 0) return "SUSPICIOUS";
  const status = lastStatus(history);
  if (status === "success") return "ISOLATED";
  if (status === "critical") return "ACTIVE";
  return "SUSPICIOUS";
}

export function deriveSeverity(
  totalScore: number,
  isCompleted: boolean,
  history: DecisionHistoryEntry[],
): Severity {
  if (isCompleted) return "LOW";
  if (history.length === 0) return "HIGH";
  const status = lastStatus(history);
  if (status === "critical") return "CRITICAL";
  if (totalScore >= 30) return "LOW";
  if (totalScore >= 10) return "MEDIUM";
  return "HIGH";
}

export function buildTimeline(history: DecisionHistoryEntry[]): TimelineSeed[] {
  const entries: TimelineSeed[] = INCIDENT_DOSSIER.baseTimeline.map((e) => ({ ...e }));

  history.forEach((entry, index) => {
    const status = (entry.status ?? "").toLowerCase();
    const minute = Math.min(21 + index + 1, 59);
    const time = `03:${String(minute).padStart(2, "0")}`;

    if (status === "success") {
      entries.push({ time, label: "Containment action executed", tone: "success" });
    } else if (status === "warning") {
      entries.push({ time, label: "Access window extended", tone: "warning" });
    } else if (status === "critical") {
      entries.push({ time, label: "Unauthorized activity escalated", tone: "critical" });
    } else {
      entries.push({ time, label: "Analyst action recorded", tone: "neutral" });
    }
  });

  return entries;
}
