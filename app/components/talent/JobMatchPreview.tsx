import MaterialIcon from "../ui/MaterialIcon";
import CircularProgress from "../ui/CircularProgress";

interface JobMatch {
  title: string;
  location: string;
  company: string;
  percentage: number;
  colorClass: string;
}

const jobMatches: JobMatch[] = [
  {
    title: "Cloud Engineer",
    location: "Batam",
    company: "TechCorp Ltd",
    percentage: 95,
    colorClass: "text-tertiary",
  },
  {
    title: "Systems Admin",
    location: "Singapore",
    company: "Nusa Data Centers",
    percentage: 88,
    colorClass: "text-secondary",
  },
];

export default function JobMatchPreview() {
  return (
    <div className="xl:col-span-1 animate-stagger stagger-delay-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface">
          Top Matches
        </h2>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {jobMatches.map((job) => (
          <div
            key={job.title}
            className="glass-panel p-5 rounded-xl flex items-center gap-5 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            {/* Circular Match Indicator */}
            <CircularProgress
              percentage={job.percentage}
              colorClass={job.colorClass}
            >
              <span className="font-[var(--font-mono)] text-[10px] leading-[1.2] tracking-[0.02em] font-bold text-on-surface">
                {job.percentage}%
              </span>
            </CircularProgress>

            <div className="flex-1">
              <h3 className="font-[var(--font-body)] text-[16px] leading-[1.5] font-bold text-on-surface group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-[var(--font-body)] text-[14px] leading-[1.5] text-outline-variant flex items-center gap-1 text-xs">
                  <MaterialIcon name="location_on" size="14px" />
                  {job.location}
                </span>
                <span className="w-1 h-1 bg-outline rounded-full" />
                <span className="font-[var(--font-body)] text-[14px] leading-[1.5] text-outline-variant text-xs">
                  {job.company}
                </span>
              </div>
            </div>

            <MaterialIcon
              name="arrow_forward"
              className="text-outline group-hover:text-primary transition-colors transform group-hover:translate-x-1"
            />
          </div>
        ))}

        {/* CTA */}
        <button className="mt-auto w-full py-3 border border-dashed border-white/20 text-outline-variant rounded-lg font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase hover:border-primary/50 hover:text-primary transition-colors">
          Explore Pipeline
        </button>
      </div>
    </div>
  );
}
