"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import GameRouter from "@/app/components/game/GameRouter";

export default function ScenarioGamePage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = use(params);
  const router = useRouter();

  return <GameRouter scenarioId={scenarioId} onExit={() => router.back()} />;
}
