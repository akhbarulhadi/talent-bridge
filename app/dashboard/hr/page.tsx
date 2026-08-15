"use client";

import { useEffect, useState, useCallback } from "react";
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
  talentId: string;
  talentEmail: string;
  talentJobTitle: string | null;
  talentSkor: number;
  talentSkills: unknown;
  jobId: string;
  jobTitle: string;
  jobLocation: string;
  minimumSkor: number;
  matchPercentage: number;
}

export default function HRDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [topMatches, setTopMatches] = useState<TalentMatch[]>([]);
  const [allMatches, setAllMatches] = useState<TalentMatch[]>([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalApplicants: 0,
    followingCount: 0,
    matchedTalentsCount: 0,
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

      await fetchDashboardData(user);
    };

    initDashboard();
  }, [router, supabase]);

  const fetchDashboardData = async (currentUser: any) => {
    try {
      // 1. Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("mst_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      if (jobsData) {
        setJobs(jobsData);

        const activeJobs = jobsData.filter((j) => j.status === "visible");
        const totalApplicants = jobsData.reduce(
          (acc, curr) => acc + (curr.applicant || 0),
          0
        );

        // Fetch HR profile for following count
        let followingCount = 0;
        if (currentUser) {
          const { data: hrProfile } = await supabase
            .from("profiles")
            .select("following, followed")
            .eq("id", currentUser.id)
            .single();
          if (hrProfile) {
            followingCount = ((hrProfile.following as string[]) || []).length;
          }
        }

        // 2. Fetch matching data via API
        setMatchingLoading(true);
        try {
          const matchRes = await fetch("/api/matching");
          const matchData = await matchRes.json();

          if (matchData.matches) {
            setAllMatches(matchData.matches);
            setTopMatches(matchData.matches);

            setStats({
              activeJobsCount: activeJobs.length,
              totalApplicants,
              followingCount,
              matchedTalentsCount: matchData.totalMatches || 0,
            });
          } else {
            setStats({
              activeJobsCount: activeJobs.length,
              totalApplicants,
              followingCount,
              matchedTalentsCount: 0,
            });
          }
        } catch (matchErr) {
          console.error("Failed to fetch matching data:", matchErr);
          setStats({
            activeJobsCount: activeJobs.length,
            totalApplicants,
            followingCount,
            matchedTalentsCount: 0,
          });
        } finally {
          setMatchingLoading(false);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard HR:", err);
    }
  };

  // Filter matches by selected job
  const handleJobFilter = useCallback(
    (jobId: string) => {
      setSelectedJobFilter(jobId);
      if (jobId === "all") {
        setTopMatches(allMatches);
      } else {
        setTopMatches(allMatches.filter((m) => m.jobId === jobId));
      }
    },
    [allMatches]
  );

  // Deduplicate talents for display (a talent might match multiple jobs)
  const getUniqueMatchedTalents = (matches: TalentMatch[]) => {
    const seen = new Set<string>();
    return matches.filter((m) => {
      if (seen.has(m.talentId)) return false;
      seen.add(m.talentId);
      return true;
    });
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

  const displayedMatches = getUniqueMatchedTalents(topMatches);

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4 animate-stagger stagger-delay-1">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <MaterialIcon name="work" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.activeJobsCount}</h3>
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4 animate-stagger stagger-delay-2">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MaterialIcon name="group" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.totalApplicants}</h3>
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4 animate-stagger stagger-delay-3">
            <div className="w-14 h-14 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <MaterialIcon name="handshake" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Matched Talents</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.matchedTalentsCount}</h3>
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl flex items-center gap-4 animate-stagger stagger-delay-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <MaterialIcon name="person_add" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">Following</p>
              <h3 className="text-3xl font-bold font-[var(--font-display)] text-on-surface mt-1">{stats.followingCount}</h3>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Active Job Openings (Tabel Lowongan) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl animate-stagger stagger-delay-5">
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
                        <th className="p-4">Matched</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {jobs.map((job) => {
                        const matchCountForJob = allMatches.filter(
                          (m) => m.jobId === job.id
                        ).length;

                        return (
                          <tr key={job.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-semibold text-on-surface">{job.job_title}</td>
                            <td className="p-4 text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                <MaterialIcon name="location_on" size="14px" />
                                {job.location}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-primary">{job.minimum_skor ?? 0}</td>
                            <td className="p-4 font-mono font-semibold text-on-surface">{job.applicant ?? 0} orang</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                                matchCountForJob > 0
                                  ? "bg-tertiary/20 text-tertiary border border-tertiary/30"
                                  : "bg-white/5 text-on-surface-variant border border-white/10"
                              }`}>
                                {matchCountForJob} talent
                              </span>
                            </td>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Top Matches with Job Filter */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl h-fit animate-stagger stagger-delay-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold font-[var(--font-display)] text-primary flex items-center gap-2">
                <MaterialIcon name="star" className="text-lg text-yellow-400" />
                <span>Top Matches</span>
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant font-[var(--font-mono)] mb-4">
              Talent dengan skor ≥ minimum skor lowongan.
            </p>

            {/* Job Filter Dropdown */}
            <div className="mb-5">
              <label className="block text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-on-surface-variant mb-1.5">
                Filter per Lowongan
              </label>
              <div className="relative">
                <select
                  value={selectedJobFilter}
                  onChange={(e) => handleJobFilter(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface font-[var(--font-body)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all appearance-none cursor-pointer pr-8"
                >
                  <option value="all">Semua Lowongan</option>
                  {jobs
                    .filter((j) => j.status === "visible")
                    .map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_title} — Min: {job.minimum_skor ?? 0}
                      </option>
                    ))}
                </select>
                <MaterialIcon
                  name="expand_more"
                  size="18px"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
              </div>
            </div>

            {/* Loading State */}
            {matchingLoading ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-on-surface-variant font-[var(--font-mono)]">
                  Memuat data matching...
                </p>
              </div>
            ) : displayedMatches.length === 0 ? (
              <div className="p-6 text-center">
                <MaterialIcon name="search_off" className="text-4xl text-on-surface-variant/30 mb-3 block mx-auto" />
                <p className="text-on-surface-variant font-[var(--font-mono)] text-xs">
                  {selectedJobFilter === "all"
                    ? "Belum ada kandidat yang memenuhi skor minimum lowongan aktif."
                    : "Belum ada kandidat yang cocok untuk lowongan ini."}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto hide-scrollbar">
                {displayedMatches.map((match, idx) => (
                  <div
                    key={`${match.talentId}-${match.jobId}`}
                    className="bg-surface-container p-4 rounded-xl border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {/* Rank indicator */}
                          {idx < 3 && (
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                idx === 0
                                  ? "bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-black"
                                  : idx === 1
                                  ? "bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-black"
                                  : "bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white"
                              }`}
                            >
                              {idx + 1}
                            </div>
                          )}
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {match.talentEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-[var(--font-mono)] text-[10px] uppercase tracking-wider">
                            <MaterialIcon name="work" size="10px" />
                            {match.jobTitle}
                          </span>
                          {match.talentJobTitle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-[var(--font-mono)] text-[10px] uppercase tracking-wider">
                              <MaterialIcon name="person" size="10px" />
                              {match.talentJobTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 font-mono font-bold text-xs block">
                          {match.talentSkor}
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-[var(--font-mono)] uppercase tracking-wider mt-1 block">
                          min: {match.minimumSkor}
                        </span>
                      </div>
                    </div>

                    {/* Match Percentage Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-[var(--font-mono)] text-on-surface-variant uppercase tracking-wider">
                          Match
                        </span>
                        <span className="text-[10px] font-[var(--font-mono)] font-bold text-tertiary">
                          {match.matchPercentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-500"
                          style={{ width: `${match.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Match Count Summary */}
            {!matchingLoading && displayedMatches.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="font-[var(--font-mono)] text-[11px] tracking-wider text-on-surface-variant">
                  Menampilkan{" "}
                  <span className="text-primary font-bold">
                    {displayedMatches.length}
                  </span>{" "}
                  talent yang cocok
                  {selectedJobFilter !== "all" && (
                    <span>
                      {" "}
                      untuk{" "}
                      <span className="text-secondary font-bold">
                        {jobs.find((j) => j.id === selectedJobFilter)?.job_title}
                      </span>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}