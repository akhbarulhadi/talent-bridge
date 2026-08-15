"use client";

import MaterialIcon from "./MaterialIcon";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation"; // 1. Import usePathname
import Link from "next/link";

const navLinks = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard/hr" },
  { icon: "work", label: "Jobs", href: "/dashboard/hr/jobs" },
  { icon: "group", label: "Talent Pool", href: "/dashboard/hr/talent-pool" },
  { icon: "mail", label: "Inbox", href: "/dashboard/hr/inbox" },
];

interface SideNavHRProps {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      role?: string;
      avatar_url?: string;
    };
  };
}

export default function SideNavHR({ user }: SideNavHRProps) {
  const router = useRouter();
  const pathname = usePathname(); // 2. Ambil path URL saat ini
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Gagal logout:", error.message);
        return;
      }
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Terjadi error saat proses logout", err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "HR Manager";
  const displayEmail = user?.email || "hr@company.com";
  const displayRole = user?.user_metadata?.role || "Head of Talent";
  const displayAvatar = user?.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAiktfHL49btkPyk4-XqZPOokfvZqDCm0UcjtjfMrQ2zTzx-_EdCm8crdlfF7Vkn-dVaWYL1mbY-JRiRCoqn9jeUI-Rzwp8t5HBjTIqJUgRweGEdC3X-YsZAYJFgWRrVHMe0qVKCBE9CGCtEsoiEzpFjFJyC0fkEOHblHi7NpKzBKaiaexz8YFs4WzrMrGJAod2S69V1-5JgJrKbDY5wSwQoDVlCd2C8dDf2PlXG1QzIup1cOGn8db4kg";

  return (
    <nav className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-40 py-8 bg-surface-container-low/70 backdrop-blur-md border-r border-white/10 shadow-xl rounded-r-xl">
      {/* Logo */}
      <div className="px-6 mb-12">
        <h1 className="font-[var(--font-display)] text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-primary">
          Talent Bridge
        </h1>
        <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-on-surface-variant mt-2 uppercase">
          HR Portal
        </p>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            // 3. Tentukan apakah menu ini aktif berdasarkan URL saat ini
            const isActive = pathname === link.href;

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={
                    isActive
                      ? "bg-primary/25 text-primary border-r-4 border-primary px-6 py-3 flex items-center gap-3 translate-x-1 transition-transform"
                      : "text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all duration-200"
                  }
                >
                  <MaterialIcon
                    name={link.icon}
                    // Beri ikon efek filled jika menu tersebut sedang aktif
                    filled={isActive}
                  />
                  <span className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase">
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer: User Profile + Logout */}
      <div className="px-6 mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <img
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
            alt="HR Manager Avatar"
            src={displayAvatar}
          />
          <div className="overflow-hidden">
            <p className="font-[var(--font-display)] text-[15px] leading-tight font-semibold text-on-surface truncate">
              {displayName}
            </p>
            <p className="font-[var(--font-mono)] text-[11px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant truncate">
              {displayEmail}
            </p>
            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">
              {displayRole}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-on-surface-variant hover:text-on-surface flex items-center gap-3 hover:bg-white/5 transition-all duration-200 py-2 px-2 rounded-md text-left"
        >
          <MaterialIcon name="logout" />
          <span className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase">
            Log Out
          </span>
        </button>
      </div>
    </nav>
  );
}