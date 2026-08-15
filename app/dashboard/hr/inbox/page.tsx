"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import SideNavHR from "@/app/components/ui/SideNavHR";
import MaterialIcon from "@/app/components/ui/MaterialIcon";

interface Talent {
  id: string;
  email: string;
  job_title: string | null;
  skor: number | null;
}

interface InboxMessage {
  id: string;
  talent_email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function HRInboxPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [talents, setTalents] = useState<Talent[]>([]);
  const [inboxList, setInboxList] = useState<InboxMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Form State
  const [selectedTalentId, setSelectedTalentId] = useState("");
  const [talentSearchQuery, setTalentSearchQuery] = useState(""); // State untuk teks pencarian
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);   // State buka/tutup dropdown saran
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // State Dialog Konfirmasi & Notifikasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
    setTimeout(() => setNotification((prev) => ({ ...prev, isOpen: false })), 4000);
  };

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
      fetchTalentsAndInbox();
    };

    initData();

    // Event listener untuk menutup dropdown jika klik di luar komponen
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router, supabase]);

  const fetchTalentsAndInbox = async () => {
    try {
      setDataLoading(true);
      const talentRes = await fetch("/api/talents");
      const talentData = await talentRes.json();
      if (Array.isArray(talentData)) setTalents(talentData);

      const inboxRes = await fetch("/api/inbox");
      const inboxData = await inboxRes.json();
      if (Array.isArray(inboxData)) setInboxList(inboxData);
    } catch (err) {
      console.error("Gagal memuat data inbox", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter daftar talent berdasarkan pencarian HR
  const filteredTalents = talents.filter((t) =>
    t.email.toLowerCase().includes(talentSearchQuery.toLowerCase()) ||
    (t.job_title && t.job_title.toLowerCase().includes(talentSearchQuery.toLowerCase()))
  );

  const handleSelectTalent = (talent: Talent) => {
    setSelectedTalentId(talent.id);
    setTalentSearchQuery(`${talent.email} ${talent.job_title ? `(${talent.job_title})` : ""}`);
    setIsDropdownOpen(false);
  };

  const handleSendClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalentId) {
      showNotification("error", "Pilih Talent", "Silakan pilih salah satu talent yang valid dari daftar pencarian.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmAndSend = async () => {
    setIsConfirmOpen(false);
    const targetTalent = talents.find((t) => t.id === selectedTalentId);
    if (!targetTalent) return;

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talent_id: targetTalent.id,
          talent_email: targetTalent.email,
          subject,
          message,
        }),
      });

      if (res.ok) {
        showNotification("success", "Email Terkirim", `Pesan berhasil dikirim ke ${targetTalent.email}`);
        setSubject("");
        setMessage("");
        setSelectedTalentId("");
        setTalentSearchQuery("");
        fetchTalentsAndInbox();
      } else {
        showNotification("error", "Gagal Mengirim", "Terjadi kesalahan saat menyimpan pesan ke database.");
      }
    } catch (error) {
      showNotification("error", "Terjadi Kesalahan", "Gagal terhubung ke server.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] text-on-surface-variant">Loading HR Inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-[var(--font-body)] min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      <SideNavHR user={user} />

      <main className="flex-1 md:ml-72 p-4 md:p-10 pt-24 md:pt-10 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[var(--font-display)] text-primary">HR Inbox & Messaging</h1>
          <p className="text-sm text-on-surface-variant font-[var(--font-mono)] mt-1">
            Kirim pesan atau undangan wawancara langsung ke email talent terdaftar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Kirim Pesan */}
          <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl lg:col-span-1 h-fit">
            <h2 className="text-xl font-bold font-[var(--font-display)] text-primary mb-4 flex items-center gap-2">
              <MaterialIcon name="send" className="text-lg" />
              <span>Kirim Pesan Baru</span>
            </h2>
            <form onSubmit={handleSendClick} className="space-y-4">
              
              {/* Searchable Dropdown Talent */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Cari & Pilih Talent (Penerima)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={talentSearchQuery}
                    onChange={(e) => {
                      setTalentSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) setSelectedTalentId("");
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Ketik email atau job title talent..."
                    className="w-full bg-surface-container border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="absolute right-3 top-2.5 text-on-surface-variant pointer-events-none">
                    <MaterialIcon name="search" className="text-lg" />
                  </div>
                </div>

                {/* Dropdown Panel Suggestions */}
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-surface-container border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                    {filteredTalents.length === 0 ? (
                      <div className="p-3 text-xs text-on-surface-variant font-[var(--font-mono)] text-center">
                        Tidak ada talent yang ditemukan
                      </div>
                    ) : (
                      filteredTalents.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTalent(t)}
                          className="px-4 py-2.5 hover:bg-white/5 cursor-pointer text-xs text-on-surface border-b border-white/5 transition-colors"
                        >
                          <div className="font-semibold text-primary">{t.email}</div>
                          <div className="text-on-surface-variant font-[var(--font-mono)]">
                            {t.job_title ? `Job: ${t.job_title}` : "Tanpa Job Title"} {t.skor !== null ? `• Skor: ${t.skor}` : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Subjek Pesan
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Undangan Interview SkillDock"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-[var(--font-mono)] uppercase text-on-surface-variant mb-1">
                  Isi Pesan / Email
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan atau detail jadwal interview di sini..."
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-bold text-sm shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MaterialIcon name="mail" />
                <span>Kirim Pesan</span>
              </button>
            </form>
          </div>

          {/* Tabel Riwayat Pesan Terkirim */}
          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl lg:col-span-2">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold font-[var(--font-display)] text-primary">Riwayat Pesan Terkirim</h2>
              <span className="text-xs font-[var(--font-mono)] text-on-surface-variant">Total: {inboxList.length} Pesan</span>
            </div>

            {dataLoading ? (
              <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Memuat riwayat pesan...</div>
            ) : inboxList.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-[var(--font-mono)]">Belum ada pesan yang dikirim ke talent.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 font-[var(--font-mono)] text-xs text-on-surface-variant uppercase tracking-wider">
                      <th className="p-4">Penerima</th>
                      <th className="p-4">Subjek</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {inboxList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-on-surface">{item.talent_email}</td>
                        <td className="p-4 text-on-surface-variant">
                          <div className="font-bold text-on-surface">{item.subject}</div>
                          <div className="text-xs text-on-surface-variant truncate max-w-xs">{item.message}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-on-surface-variant font-[var(--font-mono)]">
                          {new Date(item.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* POP-UP KONFIRMASI PENGIRIMAN */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="help" className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold font-[var(--font-display)] text-on-surface mb-2">Konfirmasi Kirim Pesan</h3>
            <p className="text-xs text-on-surface-variant font-[var(--font-mono)] mb-6">
              Apakah Anda yakin ingin mengirim pesan email ini ke talent terpilih?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-surface-container hover:bg-white/10 text-on-surface-variant text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAndSend}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold shadow hover:opacity-90 transition-opacity"
              >
                Ya, Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFIKASI TOAST KUSTOM (SUCCESS / ERROR) */}
      {notification.isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === "success"
                ? "bg-green-950/90 border-green-500/40 text-green-200"
                : "bg-red-950/90 border-red-500/40 text-red-200"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <MaterialIcon name={notification.type === "success" ? "check" : "error"} className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-[var(--font-display)]">{notification.title}</h4>
              <p className="text-xs opacity-90 font-[var(--font-mono)]">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}