import {
  Heart,
  Zap,
  Moon,
  Wind,
  Droplets,
  Flame,
  Footprints,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import MetricRing from "@/components/MetricRing";
import StatCard from "@/components/StatCard";
import HRVChart from "@/components/charts/HRVChart";
import HeartRateChart from "@/components/charts/HeartRateChart";
import {
  today,
  yesterday,
  last30Days,
  hourlyHR,
  workouts,
  getRecoveryColor,
  getRecoveryLabel,
  getStrainColor,
  getStrainLabel,
} from "@/lib/mockData";

function TrendIcon({ value, prev }: { value: number; prev: number }) {
  const diff = value - prev;
  if (diff > 0) return <TrendingUp size={14} className="text-bear-recovery" />;
  if (diff < 0) return <TrendingDown size={14} className="text-bear-danger" />;
  return <Minus size={14} className="text-bear-subtle" />;
}

export default function Dashboard() {
  const recoveryColor = getRecoveryColor(today.recovery);
  const strainColor = getStrainColor(today.strain);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Wasinee</h1>
          <p className="text-bear-subtle text-sm mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-bear-recovery animate-pulse" />
          <span className="text-sm font-medium">Live Sync</span>
        </div>
      </div>

      {/* 3 Score Rings */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Recovery */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-recovery">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              Recovery
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={today.recovery} prev={yesterday.recovery} />
              <span>vs yesterday</span>
            </div>
          </div>
          <MetricRing
            value={today.recovery}
            max={100}
            size={168}
            strokeWidth={14}
            color={recoveryColor}
            label="recovery"
            sublabel={getRecoveryLabel(today.recovery)}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{today.hrv}</p>
              <p className="text-xs text-bear-subtle">HRV ms</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{today.restingHR}</p>
              <p className="text-xs text-bear-subtle">Resting HR</p>
            </div>
          </div>
        </div>

        {/* Strain */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-strain">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              Strain
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={today.strain} prev={yesterday.strain} />
              <span>vs yesterday</span>
            </div>
          </div>
          <MetricRing
            value={today.strain}
            max={21}
            size={168}
            strokeWidth={14}
            color={strainColor}
            label="/ 21 strain"
            sublabel={getStrainLabel(today.strain)}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{today.calories.toLocaleString()}</p>
              <p className="text-xs text-bear-subtle">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{today.steps.toLocaleString()}</p>
              <p className="text-xs text-bear-subtle">Steps</p>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-sleep">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              Sleep
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={today.sleep.score} prev={yesterday.sleep.score} />
              <span>vs yesterday</span>
            </div>
          </div>
          <MetricRing
            value={today.sleep.score}
            max={100}
            size={168}
            strokeWidth={14}
            color="#8b5cf6"
            label="sleep score"
            sublabel={
              today.sleep.score >= 75
                ? "Restorative"
                : today.sleep.score >= 50
                  ? "Adequate"
                  : "Poor"
            }
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{today.sleep.duration}h</p>
              <p className="text-xs text-bear-subtle">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{today.sleep.efficiency}%</p>
              <p className="text-xs text-bear-subtle">Efficiency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="SpO2"
          value={today.spo2}
          unit="%"
          icon={Droplets}
          iconColor="#3b82f6"
          trend={0.2}
          subtitle="normal range"
        />
        <StatCard
          label="Respiratory Rate"
          value={today.respiratoryRate}
          unit="br/min"
          icon={Wind}
          iconColor="#00d4aa"
          trend={-0.8}
          subtitle="vs baseline"
        />
        <StatCard
          label="Active Calories"
          value={today.calories.toLocaleString()}
          unit="kcal"
          icon={Flame}
          iconColor="#f59e0b"
          trend={12}
          subtitle="above target"
        />
        <StatCard
          label="Steps"
          value={today.steps.toLocaleString()}
          icon={Footprints}
          iconColor="#8b5cf6"
          trend={-5}
          subtitle="goal: 10,000"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <HRVChart data={last30Days} days={14} />
        <HeartRateChart data={hourlyHR} />
      </div>

      {/* Recent Workouts */}
      <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <a href="/activity" className="text-xs text-bear-strain hover:text-blue-400 transition-colors">
            View all →
          </a>
        </div>
        <div className="space-y-3">
          {workouts.slice(0, 3).map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-bear-muted flex items-center justify-center text-xl">
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{w.name}</p>
                <p className="text-xs text-bear-subtle">
                  {w.startTime} · {w.duration}min
                </p>
              </div>
              <div className="text-right">
                <p
                  className="font-bold text-sm"
                  style={{ color: getStrainColor(w.strain) }}
                >
                  {w.strain.toFixed(1)}
                </p>
                <p className="text-xs text-bear-subtle">strain</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-bear-heart">{w.avgHR}</p>
                <p className="text-xs text-bear-subtle">avg bpm</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-bear-warning">{w.calories}</p>
                <p className="text-xs text-bear-subtle">kcal</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
