import { create } from "zustand";
import type { DecisionStatus } from "@/app/types/game";

/**
 * Tiny, presentation-only bridge so the Cybersecurity React UI can trigger
 * an ambient screen-pulse effect in the SOC Phaser scene (e.g. a red flash
 * on a critical decision). Phaser only ever reads `pulse` — it never
 * decides scenario data, and this never affects scoring/branching.
 */
interface CyberFxState {
  pulse: { status: DecisionStatus; nonce: number } | null;
  triggerPulse: (status: DecisionStatus) => void;
}

export const useCyberFxStore = create<CyberFxState>((set, get) => ({
  pulse: null,
  triggerPulse: (status) => {
    const nonce = (get().pulse?.nonce ?? 0) + 1;
    set({ pulse: { status, nonce } });
  },
}));
