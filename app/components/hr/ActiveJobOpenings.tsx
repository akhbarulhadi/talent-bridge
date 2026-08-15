import MaterialIcon from "../ui/MaterialIcon";

interface JobOpening {
  role: string;
  location: string;
  applicants: number;
  highMatch: number;
  matchColor: string;
}

const jobOpenings: JobOpening[] = [
  {
    role: "Senior DevOps Engineer",
    location: "Batam",
    applicants: 24,
    highMatch: 8,
    matchColor: "bg-tertiary/20 text-tertiary",
  },
  {
    role: "SOC Lead",
    location: "Singapore",
    applicants: 12,
    highMatch: 3,
    matchColor: "bg-secondary/20 text-secondary",
  },
];

export default function ActiveJobOpenings() {
  return (
    <section className="glass-panel-hr rounded-xl p-6 md:p-8 animate-stagger stagger-delay-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface">
          Active Job Openings
        </h3>
        <button className="btn-primary-gradient px-4 py-2 rounded-lg flex items-center gap-2 font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase text-on-primary hover:scale-[1.02] active:scale-95 transition-all">
          <MaterialIcon name="add" size="14px" />
          Post New Job
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-on-surface-variant font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase">
              <th className="pb-4 font-normal">Role / Location</th>
              <th className="pb-4 font-normal text-right">Applicants</th>
              <th className="pb-4 font-normal text-right">High Match</th>
              <th className="pb-4 font-normal text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-[var(--font-body)] text-[16px] leading-[1.5] text-on-surface">
            {jobOpenings.map((job) => (
              <tr
                key={job.role}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-4">
                  <div className="font-medium">{job.role}</div>
                  <div className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
                    <MaterialIcon name="location_on" size="14px" />
                    {job.location}
                  </div>
                </td>
                <td className="py-4 text-right font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium">
                  {job.applicants}
                </td>
                <td className="py-4 text-right">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 rounded-full ${job.matchColor} font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs`}
                  >
                    {job.highMatch}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full">
                    <MaterialIcon name="chevron_right" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
