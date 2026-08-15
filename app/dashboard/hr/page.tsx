'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function HRDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mengambil data user yang sedang login
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email ?? "Pengguna");
      } else {
        // Jika tidak ada user yang login, tendang kembali ke halaman login
        router.push('/login');
      }
      setLoading(false);
    };

    getUser();
  }, [router, supabase.auth]);

  // Fungsi untuk logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Memperbarui state aplikasi
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Dashboard */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">
            Talent Bridge <span className="text-gray-400 text-sm font-normal ml-2">| Dashboard</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang kembali!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ini adalah halaman dashboard sederhana untuk project Talent Bridge Anda.
          </p>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div>
              <h3 className="font-semibold text-gray-800">Profil Saya</h3>
              <p className="text-sm text-gray-500 mt-1">Lengkapi data diri untuk memudahkan perusahaan menemukan Anda.</p>
            </div>
            <button className="text-sm text-blue-600 font-medium text-left hover:underline">Edit Profil &rarr;</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div>
              <h3 className="font-semibold text-gray-800">Lowongan Disimpan</h3>
              <p className="text-sm text-gray-500 mt-1">Anda memiliki 0 lowongan pekerjaan yang disimpan.</p>
            </div>
            <button className="text-sm text-blue-600 font-medium text-left hover:underline">Cari Lowongan &rarr;</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div>
              <h3 className="font-semibold text-gray-800">Status Lamaran</h3>
              <p className="text-sm text-gray-500 mt-1">Pantau proses lamaran kerja Anda di sini.</p>
            </div>
            <button className="text-sm text-blue-600 font-medium text-left hover:underline">Lihat Status &rarr;</button>
          </div>
        </div>
      </main>
    </div>
  );
}