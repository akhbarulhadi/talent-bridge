/**
 * Static SOC "incident dossier" flavor for the Cybersecurity Analyst
 * presentation. This is decorative scenario context (login time, source
 * IP, base timeline, threat indicator list) — the kind of thing the spec
 * explicitly allows to live in frontend config rather than the database,
 * since it never drives scoring, consequences, or branching. All of that
 * still comes from `mst_decision` via the shared engine.
 */

export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ThreatIndicator {
  label: string;
  level: ThreatLevel;
}

export interface TimelineSeed {
  time: string;
  label: string;
  tone: "success" | "warning" | "critical" | "neutral";
}

export const INCIDENT_DOSSIER = {
  incidentId: "INC-2026-0142",
  accountEmail: "admin@company.local",
  sourceIp: "185.220.14.62",
  location: "Unknown Foreign Region",
  loginTime: "03:20",
  baseTimeline: [
    { time: "03:17", label: "Failed login attempt", tone: "critical" },
    { time: "03:18", label: "Failed login attempt", tone: "critical" },
    { time: "03:20", label: "Successful admin login", tone: "warning" },
    { time: "03:21", label: "Configuration file access attempt", tone: "critical" },
  ] as TimelineSeed[],
  threatIndicators: [
    { label: "Foreign IP", level: "HIGH" },
    { label: "Unusual login time", level: "HIGH" },
    { label: "Admin account", level: "HIGH" },
    { label: "Failed login attempts", level: "MEDIUM" },
    { label: "Configuration file access", level: "HIGH" },
  ] as ThreatIndicator[],
};
