import MaterialIcon from "./MaterialIcon";

interface TopNavBarProps {
  variant?: "talent" | "hr";
}

const talentNavLinks = [
  { label: "Dashboard", href: "/dashboard/talent", active: true },
  { label: "Simulation", href: "/dashboard/talent/simulation" },
  { label: "Upload CV", href: "#" },
];

export default function TopNavBar({ variant = "talent" }: TopNavBarProps) {
  const navLinks = variant === "talent" ? talentNavLinks : [];

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-4 h-20 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <span className="font-[var(--font-display)] text-[32px] md:text-[48px] font-bold text-primary tracking-tighter leading-none">
          SkillDock
        </span>

        {/* Desktop Navigation Links */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-6 mt-2">
            {navLinks.map((link) =>
              link.active ? (
                <a
                  key={link.label}
                  className="text-primary font-bold border-b-2 border-primary pb-1 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] leading-none hover:bg-white/5 transition-all duration-300 active:scale-95"
                  href={link.href}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  className="text-on-surface-variant font-medium hover:text-on-surface font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] leading-none hover:bg-white/5 transition-all duration-300 active:scale-95 pb-1"
                  href={link.href}
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-primary hover:bg-white/5 p-2 rounded-full transition-colors">
          <MaterialIcon name="notifications" />
        </button>
        <button className="text-primary hover:bg-white/5 p-2 rounded-full transition-colors">
          <MaterialIcon name="settings" />
        </button>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden relative">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHtFAAVHXn1HOCTFELdRIN0M0EH6gg0hKcuh9eaU1yyZ8kWGE0so8wMoww0yqTEzhCjWqSKs3f19LM0Gg6Q3B1Z4yMutBvdx_UUfiRLDBDpJSRjK5hVDIg9RhM3em0U3DLlFIwo30UMwY0iuaUw5KSJEBVRSSxNu8p791LIDBC4vlFOgjjjTnZaCN4MLxWcBCZpX96o3Xq09WcJTwdHsv3NmNI3N2cVC7G86CuKd5f28oXPZ1iIIN2OQ"
          />
        </div>
      </div>
    </nav>
  );
}
