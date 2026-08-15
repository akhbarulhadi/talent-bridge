"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Proses autentikasi email & password
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        if (authError.name === "AuthRetryableFetchError") {
          setError(
            "Tidak dapat terhubung ke server autentikasi. Periksa koneksi internet, VPN/proxy, atau ekstensi browser (ad-blocker) Anda, lalu coba lagi.",
          );
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // 2. Jika berhasil login, cek role user di tabel profiles
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          setError("Gagal mengambil data profil pengguna.");
          setLoading(false);
          return;
        }

        // 3. Redirect berdasarkan role
        if (profileData.role === "hr") {
          router.push("/dashboard/hr");
        } else {
          router.push("/dashboard/talent");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Gagal terhubung ke server. Pastikan koneksi internet Anda stabil, lalu coba lagi.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-[var(--font-body)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[5%] w-[400px] h-[400px] bg-secondary/6 rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-stagger">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                hub
              </span>
            </div>
            <h1 className="font-[var(--font-display)] text-[32px] leading-none font-bold text-primary tracking-tight">
              SkillDock
            </h1>
          </Link>
          <p className="font-[var(--font-mono)] text-[11px] tracking-[0.1em] uppercase text-on-surface-variant mt-4">
            Masuk ke akun Anda
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          {/* Inner ambient glow */}
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="relative z-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-3 animate-stagger">
                <span className="material-symbols-outlined text-error text-lg mt-0.5 shrink-0">
                  error
                </span>
                <p className="text-error text-[13px] leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-[var(--font-mono)] text-[11px] tracking-[0.05em] font-bold uppercase text-on-surface-variant mb-2"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    mail
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container border border-white/10 rounded-xl text-on-surface placeholder-on-surface-variant/50 font-[var(--font-body)] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 shadow-inner"
                    placeholder="nama@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block font-[var(--font-mono)] text-[11px] tracking-[0.05em] font-bold uppercase text-on-surface-variant mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-surface-container border border-white/10 rounded-xl text-on-surface placeholder-on-surface-variant/50 font-[var(--font-body)] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 shadow-inner"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gradient py-3.5 rounded-xl font-[var(--font-mono)] text-[13px] tracking-[0.05em] font-bold uppercase text-on-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      login
                    </span>
                    Masuk
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-on-surface-variant text-[13px]">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-primary font-medium hover:text-primary-container transition-colors"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-on-surface-variant text-[13px] hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
