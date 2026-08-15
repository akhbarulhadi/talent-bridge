import { create } from "zustand";

import {
  selectStationForProblem,
  type StationId,
} from "@/app/components/game/dataCenter/stationMapping";
import type { ProblemStatement } from "@/app/types/game";

/**
 * Presentation-specific store for the Data Center Technician's "walk to
 * the problem, press E" mechanic. This is intentionally NOT part of the
 * reusable `useGameStore` engine — other scenarios (e.g. Cybersecurity
 * Analyst) don't have a room to walk around in, so they never touch this
 * store at all.
 *
 * `DataCenterGame` (the presentation component) is responsible for
 * syncing this store to the core engine's `currentProblemStatement`
 * whenever it changes.
 */
export interface Navigation {
  /** Angle in radians from the player to the active station, world space. */
  angle: number;
  /** Distance in world/pixel units from the player to the active station. */
  distance: number;
}

interface DataCenterInteractionState {
  /** Which physical spot in the room represents the current problem statement. */
  activeStationId: StationId | null;
  /** Is the player currently standing close enough to interact? */
  isNearStation: boolean;
  /** Live angle/distance from player to the active station (for the compass). */
  navigation: Navigation | null;
  /** Is the problem/decision overlay currently open? */
  isPanelOpen: boolean;

  /** Called whenever the core engine loads a new problem statement. */
  syncToProblemStatement: (problem: ProblemStatement | null) => void;
  /** Called by the Phaser scene as the player enters/leaves interact range. */
  setNearStation: (near: boolean) => void;
  /** Called by the Phaser scene each frame (throttled) to drive the compass. */
  setNavigation: (nav: Navigation | null) => void;
  /** Reveals the problem/decision panel — only takes effect if near the station. */
  openPanel: (canOpen: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeStationId: null as StationId | null,
  isNearStation: false,
  navigation: null as Navigation | null,
  isPanelOpen: false,
};

export const useDataCenterInteraction = create<DataCenterInteractionState>(
  (set, get) => ({
    ...initialState,

    syncToProblemStatement: (problem) => {
      set({
        isPanelOpen: false,
        isNearStation: false,
        navigation: null,
        activeStationId: problem ? selectStationForProblem(problem) : null,
      });
    },

    setNearStation: (near) => {
      if (get().isNearStation === near) return;
      set({ isNearStation: near });
    },

    setNavigation: (nav) => set({ navigation: nav }),

    /**
     * `canOpen` is passed in by the caller (true when the core engine has
     * a loaded problem statement, isn't loading, and isn't completed) so
     * this store never has to import the core engine.
     */
    openPanel: (canOpen) => {
      const state = get();
      if (!canOpen || !state.isNearStation || state.isPanelOpen) return;
      set({ isPanelOpen: true });
    },

    reset: () => set({ ...initialState }),
  }),
);
