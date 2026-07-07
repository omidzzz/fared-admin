import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  iconBgColor,
  iconTextColor,
}: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <div className="card p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-secondary)] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp size={14} className="text-green-600" />
          ) : (
            <TrendingDown size={14} className="text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
          <span className="text-xs text-[var(--text-muted)] mr-1">
            نسبت به ماه گذشته
          </span>
        </div>
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}
      >
        <Icon size={22} className={iconTextColor} />
      </div>
    </div>
  );
}
