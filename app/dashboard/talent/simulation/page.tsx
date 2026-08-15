'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

import TopNavBar from "@/app/components/ui/TopNavBar";
import SideNavTalent from "@/app/components/ui/SideNavTalent";

interface TitleItem {
  id: string; // atau id_title sesuaikan dengan kolom DB Anda
  name: string;
  created_at: string;
}

export default function ScenariosTitlePage() {
  const router = useRouter();
  const supabase = createClient();

  const [titles, setTitles] = useState<TitleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      // Mengambil data dari tabel title Anda (sesuaikan nama tabel jika berbeda, misal: mst_title)
      const { data, error } = await supabase
        .from('mst_title') 
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Gagal memuat data title:", error);
      } else {
        setTitles(data || []);
      }
      setLoading(false);
    };

    fetchTitles();
  }, [supabase]);

  return (
    <div className="bg-background text-on-surface font-[var(--font-body)] min-h-screen overflow-x-hidden">
      <TopNavBar variant="talent" />
      <SideNavTalent />

      <main className="lg:ml-72 mt-20 p-6 md:p-10 max-w-[1440px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pilih Jalur & Judul Simulasi</h1>
          <p className="text-gray-400 text-sm">Pilih bidang atau judul operasional yang ingin Anda uji keterampilannya.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-900 animate-pulse rounded-xl border border-gray-800" />
            ))}
          </div>
        ) : titles.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center text-gray-400">
            Belum ada data Title yang tersedia di database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {titles.map((item) => (
              <Link 
                key={item.id} 
                href={`/dashboard/talent/simulation/${item.id}`}
                className="group bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-green-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-green-400 mb-2 uppercase tracking-wider">
                    ID: {item.id.slice(0, 8)}...
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs font-mono">
                    Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm font-medium text-gray-300 group-hover:text-green-400">
                  <span>Lihat Skenario</span>
                  <span>➔</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}