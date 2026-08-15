import type { ComponentType } from "react";
import DataCenterGame from "./dataCenter/DataCenterGame";
import CybersecurityGame from "./cyber/CybersecurityGame";

export interface GamePresentationProps {
  scenarioId: string;
  onExit: () => void;
}

/**
 * Maps a scenario's title name (`mst_title.name`) to the React component
 * that presents it (its own Phaser scene + UI). This is the ONLY place
 * `mst_title.name` is used to make a decision — and it's purely a
 * presentation choice, never game/branching logic. Adding a new scenario
 * type (e.g. "NOC Operator") only requires building its presentation
 * component and adding one line here; the decision-tree engine
 * (`useGameStore`) never changes.
 */
const PRESENTATION_MAP: Record<string, ComponentType<GamePresentationProps>> = {
  "Data Center Technician": DataCenterGame,
  "Cybersecurity Analyst": CybersecurityGame,
};

const DEFAULT_PRESENTATION: ComponentType<GamePresentationProps> = DataCenterGame;

export function getPresentationForTitle(
  titleName: string | null,
): ComponentType<GamePresentationProps> {
  if (!titleName) return DEFAULT_PRESENTATION;
  return PRESENTATION_MAP[titleName] ?? DEFAULT_PRESENTATION;
}
