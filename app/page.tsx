"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    icon: "psychology",
    title: "Decision Simulation",
    description:
      "Hadapi skenario dunia nyata melalui simulasi interaktif yang menguji kemampuan berpikir kritis dan pengambilan keputusan Anda.",
    gradient: "from-primary-container to-primary",
  },
  {
    icon: "leaderboard",
    title: "Skor & Peringkat",
    description:
      "Dapatkan skor berdasarkan performa simulasi. Semakin tinggi skor, semakin besar peluang ditemukan oleh perusahaan.",
    gradient: "from-secondary-container to-secondary",
  },
  {
    icon: "work",
    title: "Smart Matching",
    description:
      "Algoritma matching otomatis mencocokkan skor Anda dengan minimum skor lowongan perusahaan. Tanpa harus melamar manual.",
    gradient: "from-tertiary-container to-tertiary",
  },
  {
    icon: "description",
    title: "CV Intelligence",
    description:
      "Upload CV Anda dan biarkan AI menganalisis kecocokan skill dengan kebutuhan industri secara otomatis.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: "group",
    title: "Network & Follow",
    description:
      "Bangun jaringan profesional. HR bisa follow talent potensial, dan talent bisa melihat siapa yang tertarik.",
    gradient: "from-secondary to-tertiary",
  },
  {
    icon: "mail",
    title: "Direct Inbox",
    description:
      "HR dapat langsung mengirim pesan ke talent terbaik. Komunikasi tanpa hambatan untuk rekrutmen cepat.",
    gradient: "from-tertiary to-primary",
  },
];

const stats = [
  { value: "500+", label: "Talent Aktif", icon: "person" },
  { value: "120+", label: "Lowongan", icon: "work" },
  { value: "95%", label: "Match Rate", icon: "thumb_up" },
  { value: "50+", label: "Perusahaan", icon: "apartment" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-[var(--font-body)] overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-tertiary/6 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Bar */}
      <header className="fixed w-full top-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                hub
              </span>
            </div>
            <h1 className="font-[var(--font-display)] text-[28px] leading-none font-bold text-primary tracking-tight">
              SkillDock
            </h1>
          </Link>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="btn-primary-gradient px-6 py-2.5 rounded-xl font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase text-on-primary hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span className="material-symbols-outlined text-primary text-sm">
                rocket_launch
              </span>
              <span className="font-[var(--font-mono)] text-[11px] tracking-[0.05em] font-bold uppercase text-primary">
                Platform Gamifikasi Karier #1 di Indonesia
              </span>
            </div>

            {/* Heading */}
            <h1
              className={`font-[var(--font-display)] text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.03em] font-bold mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <span className="text-on-surface">Level Up Karier</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Melalui Simulasi
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`max-w-2xl mx-auto font-[var(--font-body)] text-[16px] sm:text-[18px] leading-[1.6] text-on-surface-variant mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              SkillDock menghubungkan talenta terbaik dengan perusahaan impian
              melalui{" "}
              <span className="text-secondary font-medium">
                simulasi decision-making
              </span>{" "}
              dan{" "}
              <span className="text-tertiary font-medium">
                smart matching berbasis skor
              </span>
              . Buktikan kemampuanmu, bukan hanya CV.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <Link
                href="/login"
                className="btn-primary-gradient px-8 py-4 rounded-xl font-[var(--font-mono)] text-[13px] tracking-[0.05em] font-bold uppercase text-on-primary hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-xl shadow-primary/25 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  play_arrow
                </span>
                Mulai Sekarang
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl font-[var(--font-mono)] text-[13px] tracking-[0.05em] font-bold uppercase text-on-surface-variant border border-white/10 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  info
                </span>
                Pelajari Lebih Lanjut
              </a>
            </div>

            {/* Hero Visual: Floating Cards Preview */}
            <div
              className={`mt-16 lg:mt-20 relative transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="glass-panel rounded-2xl p-8 max-w-3xl mx-auto relative overflow-hidden">
                {/* Ambient glow inside card */}
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-secondary/20 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary/15 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-3 gap-4">
                  {/* Mini Stat Cards */}
                  <div className="bg-surface-container/80 rounded-xl p-4 border border-white/5 text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg">
                        trending_up
                      </span>
                    </div>
                    <p className="font-[var(--font-mono)] text-[20px] font-bold text-on-surface">
                      85
                    </p>
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">
                      Skor Rata-rata
                    </p>
                  </div>

                  <div className="bg-surface-container/80 rounded-xl p-4 border border-white/5 text-center">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/20 mx-auto mb-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                    </div>
                    <p className="font-[var(--font-mono)] text-[20px] font-bold text-on-surface">
                      92%
                    </p>
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">
                      Match Rate
                    </p>
                  </div>

                  <div className="bg-surface-container/80 rounded-xl p-4 border border-white/5 text-center">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 mx-auto mb-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        workspace_premium
                      </span>
                    </div>
                    <p className="font-[var(--font-mono)] text-[20px] font-bold text-on-surface">
                      Gold
                    </p>
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">
                      Rank Tertinggi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 lg:px-8 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center animate-stagger ${`stagger-delay-${i + 1}`}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {stat.icon}
                    </span>
                  </div>
                  <p className="font-[var(--font-display)] text-[36px] leading-none font-bold text-on-surface mb-1">
                    {stat.value}
                  </p>
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-wider text-on-surface-variant">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-28 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <p className="font-[var(--font-mono)] text-[11px] tracking-[0.1em] font-bold uppercase text-primary mb-3">
                Fitur Unggulan
              </p>
              <h2 className="font-[var(--font-display)] text-[32px] sm:text-[40px] leading-[1.1] font-bold text-on-surface mb-4">
                Satu Platform,{" "}
                <span className="text-primary">Semua Kebutuhan</span>
              </h2>
              <p className="max-w-xl mx-auto text-on-surface-variant text-[15px] leading-relaxed">
                Dari simulasi keputusan hingga matching otomatis dengan
                perusahaan — SkillDock dirancang untuk revolusi cara kamu
                membangun karier.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`glass-panel rounded-xl p-6 group cursor-default animate-stagger stagger-delay-${i + 1}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span
                      className="material-symbols-outlined text-on-primary text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {feature.icon}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="font-[var(--font-display)] text-[18px] font-semibold text-on-surface mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 lg:py-28 px-6 lg:px-8 bg-surface-container-low/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-[var(--font-mono)] text-[11px] tracking-[0.1em] font-bold uppercase text-secondary mb-3">
                Cara Kerja
              </p>
              <h2 className="font-[var(--font-display)] text-[32px] sm:text-[40px] leading-[1.1] font-bold text-on-surface">
                Tiga Langkah Menuju{" "}
                <span className="text-secondary">Karier Impian</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: "play_circle",
                  title: "Ikuti Simulasi",
                  desc: "Pilih skenario sesuai bidang karier Anda dan selesaikan decision-making simulation.",
                  color: "primary",
                },
                {
                  step: "02",
                  icon: "emoji_events",
                  title: "Dapatkan Skor",
                  desc: "Setiap keputusan menghasilkan skor. Akumulasi skor menentukan ranking dan visibilitas Anda.",
                  color: "secondary",
                },
                {
                  step: "03",
                  icon: "handshake",
                  title: "Ditemukan HR",
                  desc: "HR melihat talent dengan skor tertinggi. Jika cocok, mereka langsung menghubungi Anda.",
                  color: "tertiary",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`relative animate-stagger stagger-delay-${i + 1}`}
                >
                  {/* Step Number */}
                  <div
                    className={`font-[var(--font-display)] text-[72px] leading-none font-bold text-${item.color}/10 absolute -top-4 -left-2`}
                  >
                    {item.step}
                  </div>

                  <div className="relative z-10 pt-10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-${item.color}/15 border border-${item.color}/20 flex items-center justify-center mb-5`}
                    >
                      <span
                        className={`material-symbols-outlined text-${item.color} text-2xl`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="font-[var(--font-display)] text-[20px] font-semibold text-on-surface mb-2">
                      {item.title}
                    </h3>
                    <p className="text-on-surface-variant text-[14px] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-panel rounded-2xl p-10 lg:p-14 relative overflow-hidden">
              {/* Ambient Glow */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -left-20 -top-20 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                <span
                  className="material-symbols-outlined text-primary text-5xl mb-6 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
                <h2 className="font-[var(--font-display)] text-[28px] sm:text-[36px] leading-[1.1] font-bold text-on-surface mb-4">
                  Siap Memulai Perjalanan?
                </h2>
                <p className="text-on-surface-variant text-[15px] leading-relaxed mb-8 max-w-lg mx-auto">
                  Bergabunglah dengan ratusan talent yang sudah meningkatkan
                  karier mereka melalui SkillDock. Gratis, tanpa komitmen.
                </p>
                <Link
                  href="/login"
                  className="btn-primary-gradient inline-flex items-center gap-2 px-8 py-4 rounded-xl font-[var(--font-mono)] text-[13px] tracking-[0.05em] font-bold uppercase text-on-primary hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-xl shadow-primary/25"
                >
                  <span className="material-symbols-outlined text-lg">
                    login
                  </span>
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-surface-container-lowest/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  hub
                </span>
              </div>
              <span className="font-[var(--font-display)] text-[20px] font-bold text-on-surface-variant">
                SkillDock
              </span>
            </div>

            {/* Copyright */}
            <p className="font-[var(--font-mono)] text-[11px] tracking-wider text-on-surface-variant uppercase">
              &copy; {new Date().getFullYear()} SkillDock — Talent Bridge. All
              rights reserved.
            </p>

            {/* Links */}
            <div className="flex gap-6">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}