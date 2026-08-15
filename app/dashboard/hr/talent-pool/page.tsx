"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import SideNavHR from "@/app/components/ui/SideNavHR";
import MaterialIcon from "@/app/components/ui/MaterialIcon";

interface Talent {
  id: string;
  email: string;
  role: string;
  job_title: string | null;
  skor: number | null;
}

export default function TalentPoolPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  // State untuk Modal Detail Profil
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cek Auth User & Ambil Data Talents
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

      fetchTalents();
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

  const handleOpenProfileModal = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsModalOpen(true);
  };

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

        {/* List / Table Talent Pool */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {talentsLoading ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Memuat data talent pool...</div>
          ) : talents.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Belum ada data talent yang tersedia.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-[var(--font-mono)] text-xs text-on-surface-variant uppercase tracking-wider">
                    <th className="p-4">Email Kandidat</th>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Skor</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {talents.map((talent) => (
                    <tr key={talent.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-on-surface">{talent.email}</td>
                      <td className="p-4 text-on-surface-variant">{talent.job_title || "-"}</td>
                      <td className="p-4 font-mono font-bold text-primary">
                        {talent.skor !== null ? `${talent.skor}` : "-"}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {talent.role}
                        </span>
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
                  ))}
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
                <span className="block text-on-surface-variant uppercase tracking-wider mb-1">Role Akses</span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase">
                  {selectedTalent.role}
                </span>
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