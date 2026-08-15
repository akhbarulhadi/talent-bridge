"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const PhaserServerRoom = dynamic(() => import('@/components/PhaserServerRoom'), {
  ssr: false,
  loading: () => <div className="text-green-500 animate-pulse text-xl">Memuat Sistem Data Center...</div>
});

export default function ServerRoomPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkUser();
  }, [router, supabase]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black" />; 
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-mono">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-2">Mainframe Access</h1>
        <p className="text-gray-400">Status: <span className="text-green-400">ONLINE</span></p>
      </div>

      <PhaserServerRoom />
      
      <p className="mt-6 text-gray-500 text-sm max-w-lg text-center">
        Simulasi 2D interaktif. Jelajahi antar rak server menggunakan kontrol keyboard Anda layaknya sedang bermain game.
      </p>
    </main>
  );
}