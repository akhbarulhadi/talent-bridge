import MaterialIcon from "../ui/MaterialIcon";

const extractedSkills = [
  { name: "Next.js", color: "primary" },
  { name: "Python", color: "secondary" },
  { name: "AWS", color: "tertiary" },
  { name: "Docker", color: "primary" },
  { name: "React", color: "primary" },
];

export default function CVStatusCard() {
  return (
    <div className="glass-panel rounded-xl p-8 flex flex-col justify-between animate-stagger stagger-delay-1">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-outline uppercase tracking-wider mb-1">
              CV Status
            </p>
            <h3 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-tertiary">
              Active
            </h3>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 text-center min-w-[80px]">
            <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-2xl font-bold text-on-surface">
              92
              <span className="text-sm text-outline-variant">/100</span>
            </p>
            <p className="font-[var(--font-mono)] text-[10px] leading-none tracking-[0.05em] font-bold text-outline-variant mt-1 uppercase">
              Score
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-outline mb-3 uppercase">
            Extracted Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {extractedSkills.map((skill) => (
              <span
                key={skill.name}
                className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs bg-${skill.color}/10 text-${skill.color} border border-${skill.color}/20 px-2 py-1 rounded-md`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-transparent border border-white/20 text-on-surface rounded-lg font-[var(--font-body)] text-[14px] leading-[1.5] hover:bg-white/5 hover:border-white/40 transition-all flex justify-center items-center gap-2">
        View Details
        <MaterialIcon name="arrow_forward" size="14px" />
      </button>
    </div>
  );
}
