"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export default function PhaserSOCGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const [{ default: PhaserLib }, { default: SOCScene }] = await Promise.all([
        import("phaser"),
        import("./SOCScene"),
      ]);

      if (destroyed || !containerRef.current) return;

      const game = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        parent: containerRef.current,
        backgroundColor: "#070a14",
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        scale: {
          mode: PhaserLib.Scale.RESIZE,
          autoCenter: PhaserLib.Scale.CENTER_BOTH,
        },
        render: {
          antialias: true,
        },
        scene: [SOCScene],
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
