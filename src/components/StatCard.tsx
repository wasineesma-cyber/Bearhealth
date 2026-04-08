import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  subtitle?: string;
  className?: string;
}

export default function StatCard({
  label, value, unit, icon: Icon,
  iconColor = "#888", trend, subtitle, className,
}: StatCardProps) {
  return (
    <div className={clsx("glass rounded-2xl p-4 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-bear-subtle uppercase tracking-wider">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold leading-none">
          {value == null ? <span className="text-bear-subtle text-2xl">--</span> : typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && value != null && <span className="text-sm text-bear-subtle mb-0.5 font-medium">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={clsx(
            "text-xs font-semibold",
            trend > 0 ? "text-bear-recovery" : trend < 0 ? "text-bear-danger" : "text-bear-subtle"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
        {subtitle && <span className="text-xs text-bear-subtle">{subtitle}</span>}
      </div>
    </div>
  );
}
