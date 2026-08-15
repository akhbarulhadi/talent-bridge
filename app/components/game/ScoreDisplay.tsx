"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Gauge } from "lucide-react";

export default function ScoreDisplay({ score }: { score: number }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const displayed = useRef(score);

  useEffect(() => {
    const obj = { value: displayed.current };
    gsap.to(obj, {
      value: score,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (valueRef.current) {
          const rounded = Math.round(obj.value);
          valueRef.current.textContent = rounded > 0 ? `+${rounded}` : `${rounded}`;
        }
      },
      onComplete: () => {
        displayed.current = score;
      },
    });
  }, [score]);

  const isPositive = score > 0;
  const isNegative = score < 0;

  return (
    <div
      className={`glass-panel flex items-center gap-2 rounded-lg px-3 py-2 ${
        isPositive ? "text-tertiary" : isNegative ? "text-error" : "text-on-surface-variant"
      }`}
    >
      <Gauge size={16} />
      <div className="leading-none">
        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.05em] font-bold opacity-70">
          Score
        </p>
        <span ref={valueRef} className="font-[var(--font-mono)] text-[15px] font-bold">
          {score > 0 ? `+${score}` : score}
        </span>
      </div>
    </div>
  );
}
