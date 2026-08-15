import MaterialIcon from "./MaterialIcon";

const navLinks = [
  { icon: "grid_view", label: "Home", active: true },
  { icon: "trending_up", label: "Growth" },
  { icon: "groups", label: "Network" },
  { icon: "mail", label: "Inbox" },
  { icon: "monitoring", label: "Analytics" },
];

const footerLinks = [
  { icon: "help", label: "Support" },
  { icon: "logout", label: "Log Out" },
];

export default function SideNavTalent() {
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWg-CKScFvYWiQFF0VZtv2ODTHbpUJDNIt-nzcUVbDenm2z6Xxos_Qwdo9SUvaIganacpyj4GdAe_503RMi_1uY0d3VZ9jREtr6rdKZiOXTjYbX0U4cVyxbSJafWuNfItSB402WV3hdfuqT1OC8oDdrqTfOMF7uCfaB2oHMBzWS-d7tunO1TmKweVY7VhcLd2iAIw3_-10uX1fadsIcC5NKr-Z-4oVQpJghoUHNehIrKnby73IRnzLSA"
              />
            </div>
            <div>
              <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-tertiary">
                Alex Rivera
              </h2>
              <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-secondary">
                Elite Rank - Gold III
              </p>
            </div>
          </div>
          <button className="w-full py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold hover:bg-primary/20 transition-all">
            Level Up
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) =>
            link.active ? (
              <a
                key={link.label}
                className="bg-primary/20 text-primary border-r-4 border-primary px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 translate-x-1 rounded-l-lg"
                href="#"
              >
                <MaterialIcon name={link.icon} />
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                className="text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 rounded-l-lg"
                href="#"
              >
                <MaterialIcon name={link.icon} />
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto space-y-2 pt-8 border-t border-white/10">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              className="text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 font-[var(--font-body)] text-[16px] leading-[1.5] hover:bg-white/5 transition-all duration-200 rounded-lg"
              href="#"
            >
              <MaterialIcon name={link.icon} />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
