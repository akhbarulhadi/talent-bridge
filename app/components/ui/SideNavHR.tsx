import MaterialIcon from "./MaterialIcon";

const navLinks = [
  { icon: "dashboard", label: "Dashboard", active: true, filled: true },
  { icon: "work", label: "Jobs" },
  { icon: "group", label: "Talent Pool" },
];

export default function SideNavHR() {
  return (
    <nav className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-40 py-8 bg-surface-container-low/70 backdrop-blur-md border-r border-white/10 shadow-xl rounded-r-xl">
      {/* Logo */}
      <div className="px-6 mb-12">
        <h1 className="font-[var(--font-display)] text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-primary">
          SkillDock
        </h1>
        <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-on-surface-variant mt-2 uppercase">
          HR Portal
        </p>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                className={
                  link.active
                    ? "bg-primary/20 text-primary border-r-4 border-primary px-6 py-3 flex items-center gap-3 translate-x-1 transition-transform"
                    : "text-on-surface-variant hover:text-on-surface px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-all duration-200"
                }
                href="#"
              >
                <MaterialIcon
                  name={link.icon}
                  filled={link.filled}
                />
                <span className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer: User Profile + Logout */}
      <div className="px-6 mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <img
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
            alt="HR Manager Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiktfHL49btkPyk4-XqZPOokfvZqDCm0UcjtjfMrQ2zTzx-_EdCm8crdlfF7Vkn-dVaWYL1mbY-JRiRCoqn9jeUI-Rzwp8t5HBjTIqJUgRweGEdC3X-YsZAYJFgWRrVHMe0qVKCBE9CGCtEsoiEzpFjFJyC0fkEOHblHi7NpKzBKaiaexz8YFs4WzrMrGJAod2S69V1-5JgJrKbDY5wSwQoDVlCd2C8dDf2PlXG1QzIup1cOGn8db4kg"
          />
          <div>
            <p className="font-[var(--font-display)] text-[16px] leading-tight font-semibold text-on-surface">
              Sarah Chen
            </p>
            <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant text-xs">
              Head of Talent
            </p>
          </div>
        </div>
        <a
          className="text-on-surface-variant hover:text-on-surface flex items-center gap-3 hover:bg-white/5 transition-all duration-200 py-2 rounded-md"
          href="#"
        >
          <MaterialIcon name="logout" />
          <span className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase">
            Log Out
          </span>
        </a>
      </div>
    </nav>
  );
}
