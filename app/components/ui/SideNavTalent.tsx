"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MaterialIcon from "./MaterialIcon";

const navLinks = [
  { icon: "grid_view", label: "Home", href: "/dashboard/talent" },
  { icon: "groups", label: "Network", href: "/dashboard/talent/network" },
  { icon: "mail", label: "Inbox", href: "/dashboard/talent/inbox" },
];
const footerLinks = [
  { icon: "help", label: "Support", href: "/support" },
];

export default function SideNavTalent() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Failed to logout:", error.message);
        return;
      }
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error during logout", err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Talent User";
  const displayAvatar = user?.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCWg-CKScFvYWiQFF0VZtv2ODTHbpUJDNIt-nzcUVbDenm2z6Xxos_Qwdo9SUvaIganacpyj4GdAe_503RMi_1uY0d3VZ9jREtr6rdKZiOXTjYbX0U4cVyxbSJafWuNfItSB402WV3hdfuqT1OC8oDdrqTfOMF7uCfaB2oHMBzWS-d7tunO1TmKweVY7VhcLd2iAIw3_-10uX1fadsIcC5NKr-Z-4oVQpJghoUHNehIrKnby73IRnzLSA";
  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 z-40 py-8 bg-surface-container-low/70 backdrop-blur-md border-r border-white/10 shadow-xl">
      <div className="flex flex-col h-full mt-20 px-4">
        {/* Profile Header */}
        <div className="mb-10 px-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border border-outline overflow-hidden">
              <img
                alt="Talent Profile Avatar"
                className="w-full h-full object-cover"
                src={displayAvatar}
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-[var(--font-display)] text-[20px] leading-[1.3] font-semibold text-tertiary truncate">
                {displayName}
              </h2>
              <p className="font-[var(--font-mono)] text-[12px] leading-[1.2] tracking-[0.02em] font-medium text-secondary truncate mt-1">
                {user?.email || "talent@company.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return isActive ? (
              <Link
                key={link.label}
                href={link.href}
                className="bg-primary/20 text-primary border-r-4 border-primary px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 translate-x-1 rounded-l-lg"
              >
                <MaterialIcon name={link.icon} />
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 rounded-l-lg"
              >
                <MaterialIcon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto space-y-2 pt-8 border-t border-white/10">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 rounded-lg"
            >
              <MaterialIcon name={link.icon} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all duration-200 rounded-lg text-left font-[var(--font-body)] text-[16px] leading-[1.5]"
          >
            <MaterialIcon name="logout" />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
