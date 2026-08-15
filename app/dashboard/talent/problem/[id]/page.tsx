'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PhaserServerRoom = dynamic(() => import('@/components/PhaserServerRoom'), {
  ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center text-green-500 animate-pulse text-xl bg-gray-900 rounded-lg">Memuat Virtual Server Room...</div>
});

interface Decision {
  id_decision: string;
  title: string;
  text: string;
  konsekuensi: string;
  status: string;
  skor: number;
  next_problem_statement_id: string | null;
}

interface ProblemStatement {
  id_problem_statement: string;
  briefing_awal: string;
  decisions: Decision[];
}

export default function InteractiveProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: initialId } = use(params); 

  const [currentProblemId, setCurrentProblemId] = useState<string>(initialId);
  const [problem, setProblem] = useState<ProblemStatement | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // STATE BARU: Untuk melacak apakah sedang dalam tahap konfirmasi pilihan
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);

  const [currentScore, setCurrentScore] = useState(0);

  // Fungsi untuk mengambil data problem dari database API
  useEffect(() => {
    const fetchProblemData = async (problemId: string) => {
      try {
        const res = await fetch(`/api/problem/${problemId}`); 
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          setSelectedDecision(null);
          setPendingDecision(null); // Reset pending saat pindah soal
        }
      } catch (error) {
        console.error("Gagal load problem:", error);
      }
    };

    if (currentProblemId) {
      fetchProblemData(currentProblemId);
    }
  }, [currentProblemId]);

  // Langkah 1: Saat opsi diklik, simpan dulu ke pendingDecision (muncul pop-up konfirmasi)
  const handleSelectDecision = (decision: Decision) => {
    setPendingDecision(decision);
  };

  // Langkah 2: Saat tombol "Ya, Terapkan" dikonfirmasi
  const handleConfirmDecision = () => {
    if (!pendingDecision) return;
    setSelectedDecision(pendingDecision);
    setCurrentScore(prev => prev + pendingDecision.skor);
    setPendingDecision(null); // Tutup pop-up konfirmasi, buka halaman konsekuensi
  };

  // Langkah 3: Saat tombol "Batal" diklik pada konfirmasi
  const handleCancelConfirmation = () => {
    setPendingDecision(null);
  };

  // Langkah 4: Saat tombol lanjut/selesai ditekan di halaman konsekuensi
  const handleNextStep = () => {
    if (!selectedDecision) return;

    if (selectedDecision.next_problem_statement_id) {
      setIsModalOpen(false);
      setCurrentProblemId(selectedDecision.next_problem_statement_id);
    } else {
      alert(`SIMULASI SELESAI!\nTotal Skor Akhir Anda: ${currentScore}\nKlik OK untuk kembali ke Dashboard.`);
      router.push('/dashboard/talent');
    }
  };

  if (!problem) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-500 animate-pulse text-xl font-bold">Sinkronisasi Database...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center py-6 px-4 font-mono relative overflow-hidden">
      <div className="absolute top-4 left-6 z-10">
        <Link href="/dashboard/talent" className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors">
          [ABORT SIMULATION]
        </Link>
      </div>

      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-green-500 mb-1">INCIDENT RESPONSE SIMULATOR</h1>
        <p className="text-gray-400 text-sm">Gunakan <span className="text-white font-bold">W A S D</span> atau <span className="text-white font-bold">Panah</span> untuk bergerak ke atas, bawah, kiri, dan kanan.<br/>Hampiri rack server yang berkedip merah dan tekan <span className="text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded border border-green-700">E</span>.</p>
      </div>

      <div className="relative">
        <PhaserServerRoom 
          missionText="ALARM AKTIF! Temukan hardware yang bermasalah!"
          score={currentScore}
          isModalOpen={isModalOpen}
          currentProblemId={currentProblemId}
          onInteract={() => setIsModalOpen(true)}
        />

        {/* OVERLAY MODAL UTAMA */}
        {isModalOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 backdrop-blur-sm rounded-lg p-6">
            <div className="bg-gray-900 border-2 border-green-900/50 w-full max-w-2xl max-h-full overflow-y-auto rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 relative">
              
              {/* KONDISI A: Belum pilih apa pun (Tampilkan Daftar Soal) */}
              {!selectedDecision && !pendingDecision && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="border-l-4 border-red-500 pl-4 bg-red-950/20 py-2">
                    <h2 className="text-xl font-bold text-red-400 mb-2">CRITICAL ALERT</h2>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                      {problem.briefing_awal}
                    </p>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-gray-500 text-sm tracking-widest uppercase">Execute Action:</h3>
                    <div className="grid gap-3">
                      {problem.decisions.map((decision) => (
                        <button
                          key={decision.id_decision}
                          onClick={() => handleSelectDecision(decision)}
                          className="w-full text-left bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all flex flex-col group"
                        >
                          <span className="font-bold text-blue-400 mb-1 group-hover:text-blue-300">{decision.title}</span>
                          <span className="text-gray-300 text-sm">{decision.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* KONDISI B: Pemain sudah klik opsi, muncul POP-UP KONFIRMASI dulu */}
              {!selectedDecision && pendingDecision && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300 text-center py-4">
                  <div className="bg-yellow-950/30 border border-yellow-600/50 p-4 rounded-lg text-yellow-400 font-bold text-lg">
                    ⚠️ Konfirmasi Tindakan
                  </div>
                  
                  <p className="text-gray-300 text-base">
                    Apakah Anda yakin ingin menerapkan tindakan ini pada sistem?
                  </p>

                  <div className="bg-gray-950 p-4 rounded-md border border-gray-800 text-left">
                    <span className="font-bold text-blue-400 block mb-1">{pendingDecision.title}</span>
                    <span className="text-gray-300 text-sm">{pendingDecision.text}</span>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCancelConfirmation}
                      className="w-1/2 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors uppercase tracking-wider"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleConfirmDecision}
                      className="w-1/2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors uppercase tracking-wider shadow-lg shadow-green-900/50"
                    >
                      Ya, Terapkan ➔
                    </button>
                  </div>
                </div>
              )}

              {/* KONDISI C: Konfirmasi sudah ditekan, tampilkan KONSEKUENSI & SKOR */}
              {selectedDecision && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 border-b border-gray-700 pb-4">
                    <span className="text-4xl drop-shadow-md">
                      {selectedDecision.skor > 0 ? '🟢' : selectedDecision.skor < 0 ? '🔴' : '🟡'}
                    </span>
                    <h3 className="text-2xl font-bold text-white">System Log Updated</h3>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed text-base bg-gray-950 p-5 rounded-md border border-gray-800">
                    {selectedDecision.konsekuensi}
                  </p>
                  
                  <div className="flex justify-between items-center bg-gray-800 p-4 rounded-md border border-gray-700">
                    <div>
                      <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Status Risiko</span>
                      <span className="font-bold text-white bg-gray-900 px-3 py-1 rounded">{selectedDecision.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Poin Diperoleh</span>
                      <span className={`font-mono text-2xl font-bold ${selectedDecision.skor >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedDecision.skor > 0 ? `+${selectedDecision.skor}` : selectedDecision.skor}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-500 transition-colors tracking-widest uppercase shadow-lg shadow-blue-900/50"
                  >
                    {selectedDecision.next_problem_statement_id ? 'Lanjut ke Tahap Berikutnya ➔' : 'Akhiri Simulasi ➔'}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </main>
  );
}