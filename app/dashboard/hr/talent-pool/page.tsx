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

interface Talent {
  id: string;
  email: string;
  role: string;
  job_title: string | null;
  skor: number | null;
  following: string[] | null;
}

export default function TalentPoolPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  // Follow data HR
  const [hrFollowing, setHrFollowing] = useState<string[]>([]);

  // Job matching
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchedTalents, setMatchedTalents] = useState<Talent[]>([]);

  // State untuk Modal Detail Profil
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cek Auth User & Ambil Data
  useEffect(() => {
    const initData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);

      // Fetch HR profile following/followed
      const { data: hrProfile } = await supabase
        .from("profiles")
        .select("following")
        .eq("id", user.id)
        .single();

      if (hrProfile) {
        setHrFollowing((hrProfile.following as string[]) || []);
      }

      fetchTalents();
      fetchJobs();
    };

    initData();
  }, [router, supabase]);

  const fetchTalents = async () => {
    try {
      setTalentsLoading(true);
      const res = await fetch("/api/talents");
      const data = await res.json();
      if (Array.isArray(data)) setTalents(data);
    } catch (err) {
      console.error("Gagal memuat data talent pool", err);
    } finally {
      setTalentsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error("Gagal memuat data jobs", err);
    }
  };

  // Determine follow status of a talent relative to the HR
  const getFollowStatus = (talent: Talent): "followed" | "followback" | null => {
    const talentId = talent.id;
    const hrId = user?.id;

    if (!hrId) return null;

    // Check if this talent follows the HR by looking at the talent's own following array
    // This is the source of truth — talent.following contains the list of HR IDs the talent follows
    const talentFollowsHR = (talent.following || []).includes(hrId);

    if (!talentFollowsHR) return null;

    // Talent follows HR. Now check if HR follows back (HR's following includes talent's id)
    const hrFollowsTalent = hrFollowing.includes(talentId);

    if (hrFollowsTalent) {
      return "followed"; // Mutual follow
    } else {
      return "followback"; // Talent follows HR, but HR hasn't followed back
    }
  };

  // Handle matching
  const handleMatch = () => {
    if (!selectedJobId) return;

    const selectedJob = jobs.find((j) => j.id === selectedJobId);
    if (!selectedJob) return;

    const matched = talents.filter((talent) => {
      if (!talent.job_title || talent.skor === null) return false;
      const titleMatch =
        talent.job_title.toLowerCase().trim() ===
        selectedJob.job_title.toLowerCase().trim();
      const skorMatch = talent.skor >= (selectedJob.minimum_skor || 0);
      return titleMatch && skorMatch;
    });

    // Sort by highest score
    matched.sort((a, b) => (b.skor || 0) - (a.skor || 0));
    setMatchedTalents(matched);
    setIsMatching(true);
  };

  const handleResetMatch = () => {
    setIsMatching(false);
    setMatchedTalents([]);
    setSelectedJobId("");
  };

  const handleOpenProfileModal = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsModalOpen(true);
  };

  // Follow back a talent (HR → Talent direction)
  // The /api/network only supports talent→HR, so we handle HR→talent directly
  const handleFollowBack = async (talentId: string) => {
    try {
      const hrId = user?.id;
      if (!hrId) return;

      // 1. Add talentId to HR's following list
      const newHrFollowing = [...hrFollowing, talentId];
      const { error: hrError } = await supabase
        .from("profiles")
        .update({ following: newHrFollowing })
        .eq("id", hrId);

      if (hrError) throw hrError;

      // 2. Add hrId to talent's followed list
      const { data: talentProfile } = await supabase
        .from("profiles")
        .select("followed")
        .eq("id", talentId)
        .single();

      const talentFollowed = ((talentProfile?.followed as string[]) || []);
      if (!talentFollowed.includes(hrId)) {
        talentFollowed.push(hrId);
      }

      const { error: talentError } = await supabase
        .from("profiles")
        .update({ followed: talentFollowed })
        .eq("id", talentId);

      if (talentError) throw talentError;

      // Update local state
      setHrFollowing(newHrFollowing);
    } catch (err) {
      console.error("Gagal follow back:", err);
    }
  };

  const displayTalents = isMatching ? matchedTalents : talents;
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant">
            Loading Talent Pool...
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[var(--font-display)] text-primary">Talent Pool</h1>
          <p className="text-sm text-on-surface-variant font-[var(--font-mono)] mt-1">
            Daftar kandidat pengguna dengan role talent beserta skor dan target job.
          </p>
        </div>

        {/* Job Matching Controls */}
        <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-2 tracking-wider">
                Pilih Lowongan untuk Matching
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary text-sm"
              >
                <option value="">— Pilih Job —</option>
                {jobs
                  .filter((j) => j.status === "visible")
                  .map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.job_title} — Min. Skor: {job.minimum_skor ?? 0}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMatch}
                disabled={!selectedJobId}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-on-primary px-5 py-2.5 rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <MaterialIcon name="auto_awesome" className="text-base" />
                Match
              </button>
              {isMatching && (
                <button
                  onClick={handleResetMatch}
                  className="flex items-center gap-2 bg-surface-container hover:bg-white/10 text-on-surface-variant px-5 py-2.5 rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold transition-colors"
                >
                  <MaterialIcon name="restart_alt" className="text-base" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Matching Result Info */}
          {isMatching && selectedJob && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-3">
              <MaterialIcon name="filter_alt" className="text-primary text-lg" />
              <p className="text-sm text-on-surface font-[var(--font-mono)]">
                Menampilkan <strong className="text-primary">{matchedTalents.length}</strong> kandidat yang cocok
                untuk posisi <strong className="text-primary">{selectedJob.job_title}</strong> dengan
                skor ≥ <strong className="text-primary">{selectedJob.minimum_skor ?? 0}</strong>
              </p>
            </div>
          )}
        </div>

        {/* List / Table Talent Pool */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {talentsLoading ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Memuat data talent pool...</div>
          ) : displayTalents.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">
              {isMatching
                ? "Tidak ada kandidat yang memenuhi kriteria matching."
                : "Belum ada data talent yang tersedia."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-[var(--font-mono)] text-xs text-on-surface-variant uppercase tracking-wider">
                    <th className="p-4">Email Kandidat</th>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Skor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {displayTalents.map((talent) => {
                    const followStatus = getFollowStatus(talent);
                    return (
                      <tr key={talent.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-on-surface">{talent.email}</td>
                        <td className="p-4 text-on-surface-variant">{talent.job_title || "-"}</td>
                        <td className="p-4 font-mono font-bold text-primary">
                          {talent.skor !== null ? `${talent.skor}` : "-"}
                        </td>
                        <td className="p-4">
                          {followStatus === "followed" && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30 inline-flex items-center gap-1.5">
                              <MaterialIcon name="check_circle" className="text-xs" />
                              Followed
                            </span>
                          )}
                          {followStatus === "followback" && (
                            <button
                              onClick={() => handleFollowBack(talent.id)}
                              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <MaterialIcon name="person_add" className="text-xs" />
                              Followback
                            </button>
                          )}
                          {followStatus === null && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-on-surface-variant border border-white/10">
                              —
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenProfileModal(talent)}
                            className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <MaterialIcon name="visibility" className="text-sm" />
                            <span>Lihat Profil</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL / POP-UP DETAIL PROFIL TALENT */}
      {isModalOpen && selectedTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            {/* Tombol Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <MaterialIcon name="close" className="text-xl" />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/30">
                <MaterialIcon name="person" className="text-3xl" />
              </div>
              <h2 className="text-xl font-bold font-[var(--font-display)] text-on-surface">
                Detail Profil Talenta
              </h2>
              <p className="text-xs text-on-surface-variant font-[var(--font-mono)] mt-1">
                Informasi detail akun dan penilaian kandidat
              </p>
            </div>

            {/* Detail Informasi */}
            <div className="space-y-4 bg-surface-container p-4 rounded-xl border border-white/5 font-[var(--font-mono)] text-xs">
              <div>
                <span className="block text-on-surface-variant uppercase tracking-wider mb-1">Email Pengguna</span>
                <span className="text-sm text-on-surface font-semibold">{selectedTalent.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-on-surface-variant uppercase tracking-wider mb-1">Job Title</span>
                  <span className="text-sm text-on-surface font-semibold">{selectedTalent.job_title || "-"}</span>
                </div>
                <div>
                  <span className="block text-on-surface-variant uppercase tracking-wider mb-1">Skor</span>
                  <span className="text-sm text-primary font-bold">{selectedTalent.skor !== null ? selectedTalent.skor : "-"}</span>
                </div>
              </div>
              <div>
                <span className="block text-on-surface-variant uppercase tracking-wider mb-1">Follow Status</span>
                {(() => {
                  const status = getFollowStatus(selectedTalent);
                  if (status === "followed") {
                    return (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-bold uppercase border border-green-500/30">
                        Followed (Mutual)
                      </span>
                    );
                  } else if (status === "followback") {
                    return (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase border border-amber-500/30">
                        Menunggu Followback
                      </span>
                    );
                  } else {
                    return (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 text-on-surface-variant font-bold uppercase border border-white/10">
                        Tidak Follow
                      </span>
                    );
                  }
                })()}
              </div>
              <div>
                <span className="block text-on-surface-variant uppercase tracking-wider mb-1">User UUID (ID)</span>
                <span className="text-on-surface break-all bg-black/20 p-2 rounded block">{selectedTalent.id}</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold shadow hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}