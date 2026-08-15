"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const [{ default: PhaserLib }, { default: DataCenterScene }] =
        await Promise.all([import("phaser"), import("./DataCenterScene")]);

      if (destroyed || !containerRef.current) return;

      const game = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        parent: containerRef.current,
        backgroundColor: "#05070f",
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        physics: {
          default: "arcade",
          arcade: { debug: false, gravity: { x: 0, y: 0 } },
        },
        scale: {
          mode: PhaserLib.Scale.RESIZE,
          autoCenter: PhaserLib.Scale.CENTER_BOTH,
        },
        render: {
          antialias: true,
          pixelArt: false,
        },
        scene: [DataCenterScene],
      });

      gameRef.current = game;
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
