import MaterialIcon from "../ui/MaterialIcon";

interface Challenge {
  title: string;
  icon: string;
  status: "completed" | "in-progress" | "locked" | "not-started" | "not-started-alt";
  points?: string;
  progress?: number;
  requirement?: string;
  borderColor: string;
}

const challenges: Challenge[] = [
  {
    title: "Data Center Technician",
    icon: "dns",
    status: "completed",
    points: "+850 pts earned",
    borderColor: "border-t-tertiary",
  },
  {
    title: "NOC Operator",
    icon: "monitoring",
    status: "in-progress",
    progress: 40,
    borderColor: "border-t-secondary",
  },
  {
    title: "Cybersecurity Analyst",
    icon: "security",
    status: "locked",
    requirement: "Requires Lvl 15",
    borderColor: "border-t-outline-variant",
  },
  {
    title: "Network Engineer",
    icon: "lan",
    status: "not-started",
    borderColor: "border-t-primary",
  },
  {
    title: "Semi-skilled Worker",
    icon: "engineering",
    status: "not-started-alt",
    borderColor: "border-t-outline",
  },
];

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const isLocked = challenge.status === "locked";

  return (
    <div
      className={`glass-panel p-5 rounded-xl border-t-2 ${challenge.borderColor} animate-stagger stagger-delay-${index + 2} transform transition-all duration-300 ${
        isLocked
          ? "opacity-60 hover:opacity-100 cursor-not-allowed"
          : "hover:-translate-y-1 cursor-pointer"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            challenge.status === "completed"
              ? "bg-tertiary/10 text-tertiary"
              : challenge.status === "in-progress"
              ? "bg-secondary/10 text-secondary"
              : challenge.status === "locked"
              ? "bg-surface-container-highest text-outline"
              : challenge.status === "not-started"
              ? "bg-primary/10 text-primary"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <MaterialIcon
            name={challenge.icon}
            filled={challenge.status === "completed"}
          />
        </div>

        {challenge.status === "completed" && (
          <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs text-tertiary bg-tertiary/10 px-2 py-1 rounded">
            Completed
          </span>
        )}
        {challenge.status === "in-progress" && (
          <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs text-secondary bg-secondary/10 px-2 py-1 rounded animate-pulse-glow">
            In Progress
          </span>
        )}
        {challenge.status === "locked" && (
          <MaterialIcon name="lock" size="14px" className="text-outline" />
        )}
      </div>

      <h3
        className={`font-[var(--font-body)] text-[16px] leading-[1.5] font-bold mb-1 ${
          isLocked ? "text-outline" : challenge.status === "not-started-alt" ? "text-on-surface-variant" : "text-on-surface"
        }`}
      >
        {challenge.title}
      </h3>

      {challenge.points && (
        <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-sm text-outline-variant">
          {challenge.points}
        </p>
      )}

      {challenge.status === "in-progress" && (
        <div className="w-full h-1.5 bg-surface-container-lowest rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full"
            style={{ width: `${challenge.progress}%` }}
          />
        </div>
      )}

      {challenge.requirement && (
        <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs text-outline-variant mt-2">
          {challenge.requirement}
        </p>
      )}

      {(challenge.status === "not-started" || challenge.status === "not-started-alt") && (
        <p
          className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs mt-2 ${
            challenge.status === "not-started" ? "text-primary" : "text-outline"
          }`}
        >
          Start Challenge →
        </p>
      )}
    </div>
  );
}

export default function ChallengePipeline() {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface">
          Challenge Pipeline
        </h2>
        <a
          className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
          href="#"
        >
          View All{" "}
          <MaterialIcon name="chevron_right" size="12px" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {challenges.map((challenge, i) => (
          <ChallengeCard key={challenge.title} challenge={challenge} index={i} />
        ))}
      </div>
    </div>
  );
}
