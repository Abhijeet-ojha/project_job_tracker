import { Application } from "@/types/application";
import { Briefcase, TrendingUp, Trophy, Target } from "lucide-react";

interface StatsBarProps {
  applications: Application[];
}

const StatsBar = ({ applications }: StatsBarProps) => {
  const total = applications.length;
  const inProgress = applications.filter(
    (a) =>
      a.columnId === "applied" ||
      a.columnId === "screening" ||
      a.columnId === "interview"
  ).length;
  const offers = applications.filter((a) => a.columnId === "offer").length;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  const stats = [
    {
      label: "Total Applications",
      value: total,
      icon: Briefcase,
      accent: "border-blue-400 dark:border-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-foreground",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: TrendingUp,
      accent: "border-amber-400 dark:border-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-foreground",
    },
    {
      label: "Offers",
      value: offers,
      icon: Trophy,
      accent: "border-emerald-400 dark:border-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-foreground",
    },
    {
      label: "Offer Rate",
      value: `${offerRate}%`,
      icon: Target,
      accent: "border-violet-400 dark:border-violet-600",
      iconBg: "bg-violet-50 dark:bg-violet-950/50",
      iconColor: "text-violet-600 dark:text-violet-400",
      valueColor:
        offerRate > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-foreground",
    },
  ];

  return (
    <div className="border-b border-border/40 bg-card/60 dark:bg-card/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-6 py-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-1 items-center gap-3 rounded-xl border-l-[3px] border border-border/50 ${stat.accent} bg-card dark:bg-card px-4 py-3 shadow-[0_1px_3px_rgba(42,52,57,0.04)] dark:shadow-none transition-shadow hover:shadow-[0_4px_12px_rgba(42,52,57,0.08)]`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <div>
              <p className={`text-xl font-bold tracking-tight ${stat.valueColor}`}>
                {stat.value}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
