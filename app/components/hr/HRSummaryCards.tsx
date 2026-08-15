import MaterialIcon from "../ui/MaterialIcon";

interface SummaryCard {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeColor: string;
  iconBg: string;
  iconColor: string;
}

const summaryCards: SummaryCard[] = [
  {
    icon: "work_outline",
    label: "Active Jobs",
    value: "12",
    change: "+2 this week",
    changeColor: "text-tertiary",
    iconBg: "bg-primary-container/20 group-hover:bg-primary-container/40",
    iconColor: "text-primary",
  },
  {
    icon: "groups",
    label: "Total Applicants",
    value: "128",
    change: "+15 new",
    changeColor: "text-secondary",
    iconBg: "bg-tertiary-container/20 group-hover:bg-tertiary-container/40",
    iconColor: "text-tertiary",
  },
  {
    icon: "verified",
    label: "High Match",
    value: "45",
    change: "35% rate",
    changeColor: "text-on-surface-variant",
    iconBg: "bg-secondary-container/20 group-hover:bg-secondary-container/40",
    iconColor: "text-secondary",
  },
];

export default function HRSummaryCards() {
  return (
    <header className="mb-12">
      <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface mb-6 animate-stagger">
        HR Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, i) => (
          <div
            key={card.label}
            className={`glass-panel-hr rounded-xl p-6 animate-stagger stagger-delay-${i + 1} hover:backdrop-blur-2xl transition-all duration-300 group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-2 rounded-lg ${card.iconBg} ${card.iconColor} transition-colors`}
              >
                <MaterialIcon name={card.icon} />
              </div>
              <span className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium ${card.changeColor}`}>
                {card.change}
              </span>
            </div>
            <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className="font-[var(--font-display)] text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-on-surface">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
