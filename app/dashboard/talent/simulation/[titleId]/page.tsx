'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

import TopNavBar from "@/app/components/ui/TopNavBar";
import SideNavTalent from "@/app/components/ui/SideNavTalent";

interface SkenarioItem {
  id: string; // Sekarang sudah bertipe string (UUID)
  skenario: string; 
  tingkat_kesulitan: string;
  estimasi_durasi: number;
  id_problem_statement: string;
  id_title: string;
}

export default function ScenariosListByTitlePage({ params }: { params: Promise<{ titleId: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { titleId } = use(params);

  const [scenarios, setScenarios] = useState<SkenarioItem[]>([]);
  const [titleName, setTitleName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil nama Title dari tabel mst_title
      const { data: titleData } = await supabase
        .from('mst_title')
        .select('name')
        .eq('id', titleId)
        .single();
      
      if (titleData) {
        setTitleName(titleData.name);
      }

      // 2. Ambil daftar skenario dari tabel mst_skenario berdasarkan id_title
      const { data: scenarioData, error } = await supabase
        .from('mst_skenario')
        .select('*')
        .eq('id_title', titleId); 

      if (error) {
        console.error("Gagal memuat skenario:", error);
      } else {
        setScenarios(scenarioData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, titleId]);

  return (
    <div className="bg-background text-on-surface font-[var(--font-body)] min-h-screen overflow-x-hidden">
      <TopNavBar variant="talent" />
      <SideNavTalent />

      <main className="lg:ml-72 mt-20 p-6 md:p-10 max-w-[1440px] mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/talent/scenarios" className="text-gray-500 hover:text-green-400 text-sm font-mono mb-3 inline-block">
            &larr; Kembali ke Daftar Title
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">
            Skenario: {titleName || "Memuat..."}
          </h1>
          <p className="text-gray-400 text-sm">Pilih modul simulasi interaktif di bawah ini untuk memulai tantangan.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 bg-gray-900 animate-pulse rounded-xl border border-gray-800" />
            ))}
          </div>
        ) : scenarios.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center text-gray-400">
            Belum ada skenario yang tersedia untuk Title ini di tabel <code className="text-green-400 font-mono">mst_skenario</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scen) => (
              <div 
                key={scen.id} 
                className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-green-500 transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-green-950 text-green-400 border border-green-800">
                      {scen.tingkat_kesulitan || "Menengah"}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      ⏱️ {scen.estimasi_durasi || 15} Menit
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                    {scen.skenario}
                  </h3>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {scen.id ? scen.id.slice(0, 6) : 'N/A'}...
                  </span>
                  
                  <Link 
                    href={`/dashboard/talent/problem/${scen.id_problem_statement}`}
                    className="bg-green-600 hover:bg-green-500 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors tracking-wide uppercase shadow-md shadow-green-950"
                  >
                    Mulai Simulasi ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}