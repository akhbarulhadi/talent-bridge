import MaterialIcon from "../ui/MaterialIcon";

interface Talent {
  name: string;
  role: string;
  matchPercentage: number;
  matchColor: string;
  avatarUrl: string;
  badgeGradient: string;
  badgeIcon: string;
  badgeIconColor: string;
}

const talents: Talent[] = [
  {
    name: "David Kim",
    role: "DevOps Engineer",
    matchPercentage: 98,
    matchColor: "text-tertiary",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAijJNjO1YYgCS0ZaVWXTOTURF9wPmiuJjdxnOdtyKhcNt4KqyLMc8zU5pjLHQCIZ1_2qSVHvpHejlJ0Y1tEeyNnEWd7DO_gSLja5-fdYhCS_WRdgT3ZHiZg1f-m3xA0kZPFSROLJ22W-1Ey44hA2qmdy-L9tRvOk012TrM2bC9otNS9EbkpAaQcPQkPHBqWTfssYlioZz0YzasC5yPQXg_6H0Ix5cHc-uwMY2b0ruhJHXVh5vg8KZnag",
    badgeGradient: "bg-gradient-to-br from-[#FFD700] to-[#B8860B]",
    badgeIcon: "workspace_premium",
    badgeIconColor: "text-black",
  },
  {
    name: "Elena Rostova",
    role: "SOC Analyst",
    matchPercentage: 92,
    matchColor: "text-secondary",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwvz_Y570BNUTWyefUH-gtjYCEI6T4rayoBHp0J6kRGTbNwUr-06Z7jmrvLq6flG_ufrmL974aJJydHjdbPcfux3YCO8tKuhtGmu3SeJOvneWc3bw2jXBSPYMc-WyI3_jBX0JY32qjWEb8-4V6YpESfFDRXu3AQ7K93WWGOdlF1oKYq4VDAWXIdgNvfi2IqnYW5WZ46ASAcrhPuo7cFNZvmxiwL0kAwlyU5p6PdyP_zzRBfluqGQczKg",
    badgeGradient: "bg-gradient-to-br from-outline to-outline-variant",
    badgeIcon: "star",
    badgeIconColor: "text-white",
  },
  {
    name: "Marcus Johnson",
    role: "Backend Dev",
    matchPercentage: 88,
    matchColor: "text-secondary",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCki5gqTuAX9OEvyEdoFH32Li7FIL2nxvQm30OLJoaWhlsd2lyWk1fZQueXdINPyaGHp30X2WUTdo26j-GQl0MqCh2uE8lrBV6QhNiRZaR0jMWL1yU9iRqNA_PwsujuvyD7aZr02M7_ojYgkSEJcSC8wFre7XrMTrzQUROQk3kpQJ1STKMgb-iQUZDfMmqbyhoz_H5VG2hG_GLQjZ748iGYlmSCn2n5ThCbGrGHP2t8_hQcdryZpjXEXw",
    badgeGradient: "bg-gradient-to-br from-outline to-outline-variant",
    badgeIcon: "star",
    badgeIconColor: "text-white",
  },
];

export default function TopMatchedTalents() {
  return (
    <div className="xl:col-span-1">
      <section className="glass-panel-hr rounded-xl p-6 animate-stagger stagger-delay-6 h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface">
            Top Matches
          </h3>
          <button className="text-primary hover:text-primary-container transition-colors">
            <MaterialIcon name="filter_list" />
          </button>
        </div>

        <div className="space-y-4">
          {talents.map((talent) => (
            <div
              key={talent.name}
              className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-4 cursor-pointer group"
            >
              {/* Avatar with rank badge */}
              <div className="relative">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  alt={`${talent.name} avatar`}
                  src={talent.avatarUrl}
                  loading="lazy"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${talent.badgeGradient} border border-surface flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <MaterialIcon
                    name={talent.badgeIcon}
                    size="10px"
                    className={talent.badgeIconColor}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-[var(--font-body)] text-[16px] leading-[1.5] text-on-surface font-medium truncate">
                  {talent.name}
                </h4>
                <p className="font-[var(--font-body)] text-[14px] leading-[1.5] text-on-surface-variant truncate">
                  {talent.role}
                </p>
              </div>

              {/* Match % */}
              <div className="text-right">
                <div className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium ${talent.matchColor}`}>
                  {talent.matchPercentage}%
                </div>
                <div className="font-[var(--font-mono)] text-[10px] leading-none tracking-[0.05em] font-bold uppercase text-on-surface-variant">
                  Match
                </div>
              </div>
            </div>
          ))}

          <button className="w-full py-3 mt-4 text-center text-primary font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20">
            View All Matches
          </button>
        </div>
      </section>
    </div>
  );
}
