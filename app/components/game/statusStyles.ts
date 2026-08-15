import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from "lucide-react";
import type { DecisionStatus } from "@/app/types/game";

export interface StatusStyle {
  border: string;
  bg: string;
  text: string;
  icon: typeof AlertTriangle;
  label: string;
}

const KNOWN_STYLES: Record<string, StatusStyle> = {
  success: {
    border: "border-tertiary/40",
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    icon: CheckCircle2,
    label: "Success",
  },
  warning: {
    border: "border-secondary/40",
    bg: "bg-secondary/10",
    text: "text-secondary",
    icon: AlertTriangle,
    label: "Warning",
  },
  critical: {
    border: "border-error/40",
    bg: "bg-error/10",
    text: "text-error",
    icon: ShieldAlert,
    label: "Critical",
  },
  neutral: {
    border: "border-outline/40",
    bg: "bg-outline/10",
    text: "text-outline",
    icon: HelpCircle,
    label: "Neutral",
  },
};

const FALLBACK_STYLE: StatusStyle = {
  border: "border-outline/30",
  bg: "bg-surface-container-highest",
  text: "text-on-surface-variant",
  icon: HelpCircle,
  label: "Info",
};

/** Always returns a usable style, even for unknown/missing status values. */
export function getStatusStyle(status: DecisionStatus): StatusStyle {
  if (!status) return FALLBACK_STYLE;
  return KNOWN_STYLES[status.toLowerCase()] ?? FALLBACK_STYLE;
}
