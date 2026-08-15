"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import SideNavHR from "@/app/components/ui/SideNavHR";
import MaterialIcon from "@/app/components/ui/MaterialIcon";

interface Job {
  id: string;
  job_title: string;
  location: string;
  minimum_skor: number;
  applicant: number;
  status: string;
  created_at: string;
}

interface TalentMatch {
  id: string;
  email: string;
  job_title: string;
  skor: number;
  matchedJobTitle: string;
}

export default function HRDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [topMatches, setTopMatches] = useState<TalentMatch[]>([]);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalApplicants: 0,
  });

  useEffect(() => {
    const initDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);

      await fetchDashboardData();
    };

    initDashboard();
  }, [router, supabase]);

  const fetchDashboardData = async () => {
    try {
      // 1. Ambil data Jobs dari tabel mst_jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("mst_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      if (jobsData) {
        setJobs(jobsData);

        // Hitung Active Jobs (status 'visible')
        const activeJobs = jobsData.filter((j) => j.status === "visible");
        
        // Hitung Total Applicants dari seluruh job
        const totalApplicants = jobsData.reduce((acc, curr) => acc + (curr.applicant || 0), 0);

        setStats({
          activeJobsCount: activeJobs.length,
          totalApplicants,
        });

        // 2. Ambil data Talents dari tabel profiles dengan role 'talent'
        const { data: talentsData, error: talentsError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "talent");

        if (talentsError) throw talentsError;

        if (talentsData) {
          // Matching Engine: Cocokkan job_title dan pastikan skor >= minimum_skor job tersebut
          const matches: TalentMatch[] = [];

          talentsData.forEach((talent) => {
            if (!talent.job_title || talent.skor === null) return;

            // Cari job di mst_jobs yang title-nya sama (case-insensitive)
            const correspondingJob = jobsData.find(
              (j) => j.job_title.toLowerCase().trim() === talent.job_title.toLowerCase().trim()
            );

            if (correspondingJob) {
              const minSkor = correspondingJob.minimum_skor || 0;
              // Jika skor talent memenuhi atau melebihi minimum skor lowongan
              if (talent.skor >= minSkor) {
                matches.push({
                  id: talent.id,
                  email: talent.email,
                  job_title: talent.job_title,
                  skor: talent.skor,
                  matchedJobTitle: correspondingJob.job_title,
                });
              }
            }
          });

          // Urutkan berdasarkan skor tertinggi
          matches.sort((a, b) => b.skor - a.skor);
          setTopMatches(matches);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard HR:", err);
    }
  };

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
      <SideNavHR user={user} />

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
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[var(--font-display)] text-primary">HR Dashboard</h1>
          <p className="text-sm text-on-surface-variant font-[var(--font-mono)] mt-1">
            Ringkasan rekrutmen, lowongan aktif, dan kandidat yang cocok.
          </p>
        </div>

        {/* Summary Cards (Active Jobs & Total Applicants) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <MaterialIcon name="work" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.activeJobsCount}</h3>
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MaterialIcon name="group" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.totalApplicants}</h3>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Active Job Openings (Tabel Lowongan) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold font-[var(--font-display)] text-primary">Active Job Openings</h2>
                <span className="text-xs font-[var(--font-mono)] text-on-surface-variant">Total: {jobs.length} Lowongan</span>
              </div>

              {jobs.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Belum ada data lowongan pekerjaan.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 font-[var(--font-mono)] text-xs text-on-surface-variant uppercase tracking-wider">
                        <th className="p-4">Job Title</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Min. Skor</th>
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-semibold text-on-surface">{job.job_title}</td>
                          <td className="p-4 text-on-surface-variant">{job.location}</td>
                          <td className="p-4 font-mono font-bold text-primary">{job.minimum_skor ?? 0}</td>
                          <td className="p-4 font-mono font-semibold text-on-surface">{job.applicant ?? 0} orang</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                job.status === "visible"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Top Matches (Kandidat Paling Cocok Berdasarkan Job Title & Skor) */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold font-[var(--font-display)] text-primary mb-4 flex items-center gap-2">
              <MaterialIcon name="star" className="text-lg text-yellow-400" />
              <span>Top Matches</span>
            </h2>
            <p className="text-xs text-on-surface-variant font-[var(--font-mono)] mb-6">
              Kandidat talent yang memenuhi syarat minimum skor dan sesuai dengan posisi lowongan.
            </p>

            {topMatches.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant font-[var(--font-mono)] text-xs">
                Belum ada kandidat yang memenuhi kecocokan skor dengan lowongan aktif.
              </div>
            ) : (
              <div className="space-y-4">
                {topMatches.map((match) => (
                  <div key={match.id} className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="truncate pr-2">
                        <p className="text-sm font-semibold text-on-surface truncate">{match.email}</p>
                        <p className="text-xs text-primary font-[var(--font-mono)] mt-0.5">Target: {match.matchedJobTitle}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 font-mono font-bold text-xs">
                        Skor: {match.skor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}