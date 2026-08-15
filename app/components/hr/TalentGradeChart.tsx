"use client";

import { useEffect, useRef } from "react";

interface GradeBar {
  label: string;
  count: number;
  targetHeight: string;
  gradient: string;
  bgColor: string;
  shadowStyle?: string;
}

const gradeBars: GradeBar[] = [
  {
    label: "Bronze",
    count: 150,
    targetHeight: "100%",
    gradient: "bg-gradient-to-t from-secondary-container to-secondary",
    bgColor: "bg-secondary-container/40",
  },
  {
    label: "Silver",
    count: 85,
    targetHeight: "56%",
    gradient: "bg-gradient-to-t from-outline-variant to-outline",
    bgColor: "bg-surface-variant",
  },
  {
    label: "Gold",
    count: 32,
    targetHeight: "21%",
    gradient: "bg-gradient-to-t from-[#B8860B] to-[#FFD700]",
    bgColor: "bg-secondary/20",
    shadowStyle: "inset 0 0 10px rgba(255,215,0,0.5)",
  },
];

export default function TalentGradeChart() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const target = bar.getAttribute("data-target");
          if (target) {
            bar.style.height = target;
          }
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="glass-panel-hr rounded-xl p-6 md:p-8 animate-stagger stagger-delay-5">
      <h3 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface mb-8">
        Talent Grade Distribution
      </h3>

      <div className="flex items-end justify-around h-48 border-b border-white/10 pb-2 mb-4">
        {gradeBars.map((bar, i) => (
          <div key={bar.label} className="flex flex-col items-center group w-1/4">
            <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {bar.count}
            </span>
            <div
              className={`w-full max-w-[60px] ${bar.bgColor} rounded-t-md relative overflow-hidden h-full flex items-end`}
            >
              <div
                ref={(el) => { barsRef.current[i] = el; }}
                className={`w-full ${bar.gradient} rounded-t-md bar-fill`}
                data-target={bar.targetHeight}
                style={{
                  height: "0%",
                  ...(bar.shadowStyle ? { boxShadow: bar.shadowStyle } : {}),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-around text-center font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase text-on-surface-variant">
        {gradeBars.map((bar) => (
          <div key={bar.label} className="w-1/4">
            {bar.label}
          </div>
        ))}
      </div>
    </section>
  );
}
