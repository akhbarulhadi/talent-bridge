"use client";

import { useEffect, useState } from "react";
import { getUserScore } from "@/app/services/game/profile.service";

export default function HeroRankCard() {
  const [email, setEmail] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user email and score
    const fetchUserData = async () => {
      try {
        const data = await getUserScore();
        setEmail(data.email);
        setScore(data.score);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden animate-stagger">
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          {/* Gold III Badge Hexagon */}
          <div className="w-24 h-24 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffddb8] via-[#ffb95f] to-[#ee9800] rounded-xl rotate-45 transform group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(255,185,95,0.3)] border-2 border-white/20 animate-badge-float" />
            <span className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-surface-container-lowest font-bold relative z-10 -rotate-45">
              III
            </span>
          </div>

          <div>
            {/* Display Email */}
            {loading ? (
              <div className="h-12 bg-surface-container-low/50 rounded animate-pulse w-64 mb-2" />
            ) : (
              <h1 className="font-[var(--font-display)] text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-on-surface mb-2">
                {email || "User"}
              </h1>
            )}
            
            {/* Display Score */}
            {loading ? (
              <div className="h-8 bg-surface-container-low/50 rounded-full w-40 animate-pulse" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-[var(--font-mono)] text-[18px] leading-[1.2] tracking-[0.02em] font-bold text-secondary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
                  Score: {score.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
