<<<<<<< Updated upstream
"use client";
=======
// File: app/dashboard/talent/page.tsx
'use client';
>>>>>>> Stashed changes

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

// Definisikan tipe data Skenario
interface Skenario {
  id_peran_skenario: string;
  peran: string;
  judul_skenario: string;
  kesulitan: string;
  estimasi_durasi: number;
  id_problem_statement: string;
}

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
  const [scenarios, setScenarios] = useState<Skenario[]>([]);

  useEffect(() => {
<<<<<<< Updated upstream
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
=======
    const initDashboard = async () => {
      // 1. Cek User Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "Pengguna");
      } else {
        router.push('/login');
        return;
      }

      // 2. Fetch Data Skenario dari API
      try {
        const res = await fetch('/api/scenarios');
        if (res.ok) {
          const data = await res.json();
          setScenarios(data);
        }
      } catch (error) {
        console.error("Gagal mengambil skenario:", error);
      } finally {
        setLoading(false);
>>>>>>> Stashed changes
      }
    };

    initDashboard();
  }, [router, supabase.auth]);

<<<<<<< Updated upstream
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant">
            Loading dashboard...
          </p>
        </div>
=======
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Memuat dashboard...</p>
>>>>>>> Stashed changes
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
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
=======
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Dashboard */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">
            Talent Bridge <span className="text-gray-400 text-sm font-normal ml-2">| Talent</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Halo, {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang di SkillDock!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Uji kemampuan Anda melalui simulasi skenario kasus nyata di bawah ini.
          </p>
        </div>

        {/* Daftar Skenario */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">Skenario Tersedia</h2>
        
        {scenarios.length === 0 ? (
          <p className="text-gray-500 text-sm bg-white p-4 rounded-md border border-gray-200">Belum ada skenario yang tersedia.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div key={scenario.id_peran_skenario} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="text-xs font-semibold text-blue-600 tracking-wide uppercase mb-1">
                    {scenario.peran}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{scenario.judul_skenario}</h3>
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>⚡</span> {scenario.kesulitan}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span> {scenario.estimasi_durasi} Menit
                    </div>
                  </div>
                </div>
                
                {/* Tombol akan mengarah ke Problem Statement Awal */}
                <Link 
                  href={`/dashboard/talent/problem/${scenario.id_problem_statement}`}
                  className="mt-6 w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Mulai Simulasi
                </Link>
              </div>
            ))}
          </div>
        )}
>>>>>>> Stashed changes
      </main>
    </div>
  );
}