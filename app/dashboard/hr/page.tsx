"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import SideNavHR from "@/app/components/ui/SideNavHR";
import MaterialIcon from "@/app/components/ui/MaterialIcon";
import HRSummaryCards from "@/app/components/hr/HRSummaryCards";
import ActiveJobOpenings from "@/app/components/hr/ActiveJobOpenings";
import TalentGradeChart from "@/app/components/hr/TalentGradeChart";
import TopMatchedTalents from "@/app/components/hr/TopMatchedTalents";

export default function HRDashboard() {
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
            Loading HR dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-[var(--font-body)] min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* SideNavBar (Desktop) */}
      <SideNavHR />

      {/* Mobile TopNavBar */}
      <nav className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-4 h-20 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <h1 className="font-[var(--font-display)] text-[32px] leading-[1.2] font-bold text-primary tracking-tighter">
          SkillDock
        </h1>
        <button className="text-primary active:scale-95 transition-transform duration-200">
          <MaterialIcon name="menu" className="text-3xl" />
        </button>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 min-h-screen">
        {/* Summary Cards */}
        <HRSummaryCards />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            <ActiveJobOpenings />
            <TalentGradeChart />
          </div>

          {/* Right Column */}
          <TopMatchedTalents />
        </div>
      </main>
    </div>
  );
}