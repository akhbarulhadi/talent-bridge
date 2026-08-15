import { create } from "zustand";

export type GamePhase = "briefing" | "entering" | "playing";

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  status: "warning" | "danger" | "info";
}

export const HOTSPOTS: Record<string, Hotspot> = {
  "rack-b14": {
    id: "rack-b14",
    title: "Rack B-14",
    description:
      "Suhu naik dari 24°C menjadi 32°C. Belum ada indikasi thermal shutdown, namun tren perlu diverifikasi.",
    status: "warning",
  },
  "crac-3": {
    id: "crac-3",
    title: "CRAC #3",
    description:
      "Unit pendingin mengeluarkan alarm. Periksa status kompresor dan aliran udara sebelum eskalasi.",
    status: "danger",
  },
  "noc-terminal": {
    id: "noc-terminal",
    title: "Terminal Monitoring",
    description:
      "Konsol NOC — gunakan untuk memverifikasi data historis suhu dan status perangkat sebelum bertindak.",
    status: "info",
  },
};

interface GameState {
  phase: GamePhase;
  objectiveText: string;
  nearbyHotspotId: string | null;
  inspectedHotspots: Record<string, boolean>;
  setPhase: (phase: GamePhase) => void;
  setNearbyHotspot: (id: string | null) => void;
  markInspected: (id: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "briefing",
  objectiveText:
    "Verifikasi kondisi Rack B-14 dan CRAC #3 sebelum melakukan eskalasi.",
  nearbyHotspotId: null,
  inspectedHotspots: {},
  setPhase: (phase) => set({ phase }),
  setNearbyHotspot: (id) => set({ nearbyHotspotId: id }),
  markInspected: (id) =>
    set((state) => ({
      inspectedHotspots: { ...state.inspectedHotspots, [id]: true },
    })),
  resetGame: () =>
    set({
      phase: "briefing",
      nearbyHotspotId: null,
      inspectedHotspots: {},
    }),
}));
