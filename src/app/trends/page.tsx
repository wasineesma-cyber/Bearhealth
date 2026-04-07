import { TrendingUp, Calendar, BarChart2, Activity } from "lucide-react";
import HRVChart from "@/components/charts/HRVChart";
import RecoveryTrendChart from "@/components/charts/RecoveryTrendChart";
import SleepTrendChart from "@/components/charts/SleepTrendChart";
import { last30Days, getRecoveryColor } from "@/lib/mockData";

function MonthCalendar({ data }: { data: typeof last30Days }) {
  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calendar size={16} className="text-bear-subtle" />
        <h3 className="font-semibold text-sm">Monthly Recovery Calendar</h3>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs text-bear-subtle font-medium py-1">
            {d}
          </div>
        ))}
        {/* Padding for first day */}
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {data.map((day, i) => {
          const color = getRecoveryColor(day.recovery);
          const opacity =
            day.recovery >= 67 ? 1 : day.recovery >= 34 ? 0.65 : 0.35;
          return (
            <div key={i} className="group relative">
              <div
                className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
                  color: day.recovery >= 34 ? color : "#fff",
                }}
              >
                {new Date(day.date).getDate()}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bear-bg border border-bear-border rounded-lg px-2 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-semibold" style={{ color }}>
                  Recovery: {day.recovery}%
                </p>
                <p className="text-bear-subtle">HRV: {day.hrv}ms</p>
                <p className="text-bear-subtle">Sleep: {day.sleep.score}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-bear-subtle">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bear-recovery opacity-90" />
          <span>High (67-100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bear-warning opacity-65" />
          <span>Medium (34-66)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bear-danger opacity-35" />
          <span>Low (0-33)</span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  unit,
  change,
  color,
}: {
  title: string;
  value: string | number;
  unit?: string;
  change: number;
  color: string;
}) {
  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-4">
      <p className="text-xs text-bear-subtle uppercase tracking-wider font-medium">{title}</p>
      <div className="flex items-end gap-1 mt-2">
        <span className="text-3xl font-bold" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-sm text-bear-subtle mb-1">{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <TrendingUp
          size={12}
          className={change >= 0 ? "text-bear-recovery" : "text-bear-danger"}
          style={{ transform: change < 0 ? "scaleY(-1)" : "none" }}
        />
        <span
          className={`text-xs font-semibold ${change >= 0 ? "text-bear-recovery" : "text-bear-danger"}`}
        >
          {change > 0 ? "+" : ""}
          {change}% vs last month
        </span>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const avgRecovery = Math.round(
    last30Days.reduce((s, d) => s + d.recovery, 0) / last30Days.length
  );
  const avgHRV = Math.round(
    last30Days.reduce((s, d) => s + d.hrv, 0) / last30Days.length
  );
  const avgSleep = (
    last30Days.reduce((s, d) => s + d.sleep.duration, 0) / last30Days.length
  ).toFixed(1);
  const avgStrain = (
    last30Days.reduce((s, d) => s + d.strain, 0) / last30Days.length
  ).toFixed(1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trends & History</h1>
          <p className="text-bear-subtle text-sm mt-1">30-day performance overview</p>
        </div>
        <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2 text-sm">
          <BarChart2 size={14} className="text-bear-subtle" />
          <span className="text-bear-subtle">Last 30 days</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Avg Recovery"
          value={avgRecovery}
          unit="%"
          change={+8}
          color="#00d4aa"
        />
        <SummaryCard
          title="Avg HRV"
          value={avgHRV}
          unit="ms"
          change={+12}
          color="#00d4aa"
        />
        <SummaryCard
          title="Avg Sleep"
          value={avgSleep}
          unit="hrs"
          change={-3}
          color="#8b5cf6"
        />
        <SummaryCard
          title="Avg Strain"
          value={avgStrain}
          unit="/ 21"
          change={+5}
          color="#3b82f6"
        />
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <MonthCalendar data={last30Days} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <RecoveryTrendChart data={last30Days} days={30} />
        <HRVChart data={last30Days} days={30} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <SleepTrendChart data={last30Days} days={30} />
      </div>
    </div>
  );
}
