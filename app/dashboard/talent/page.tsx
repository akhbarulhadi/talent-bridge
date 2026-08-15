"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import TopNavBar from "@/app/components/ui/TopNavBar";
import SideNavTalent from "@/app/components/ui/SideNavTalent";
import HeroRankCard from "@/app/components/talent/HeroRankCard";
import CVStatusCard from "@/app/components/talent/CVStatusCard";
import ChallengePipeline from "@/app/components/talent/ChallengePipeline";
import RecommendedCourses from "@/app/components/talent/RecommendedCourses";
import JobMatchPreview from "@/app/components/talent/JobMatchPreview";

export default function TalentDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }
      setLoading(false);
    };

    getUser();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-[var(--font-body)] overflow-x-hidden">
      {/* TopNavBar */}
      <TopNavBar variant="talent" />

      {/* SideNavBar */}
      <SideNavTalent />

      {/* Main Canvas */}
      <main className="lg:ml-72 mt-20 p-6 md:p-10 max-w-[1440px] mx-auto min-h-screen">
        {/* Bento Grid: Hero/Rank + CV Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <HeroRankCard />
          <CVStatusCard />
        </div>

        {/* Challenge Pipeline */}
        <ChallengePipeline />

        {/* Lower Split: Courses & Job Matches */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <RecommendedCourses />
          <JobMatchPreview />
        </div>
      </main>
    </div>
  );
}