import { Activity, Flame, Clock, Heart, TrendingUp, Zap } from "lucide-react";
import MetricRing from "@/components/MetricRing";
import StatCard from "@/components/StatCard";
import {
  today,
  workouts,
  last30Days,
  getStrainColor,
  getStrainLabel,
} from "@/lib/mockData";

function WorkoutCard({
  workout,
}: {
  workout: (typeof workouts)[0];
}) {
  const strainColor = getStrainColor(workout.strain);
  const maxHRPct = Math.round((workout.avgHR / workout.maxHR) * 100);

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5 hover:border-bear-muted transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-bear-muted flex items-center justify-center text-2xl">
          {workout.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{workout.name}</h3>
              <p className="text-xs text-bear-subtle mt-0.5">
                {workout.startTime} · {workout.duration} minutes
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                color: strainColor,
                backgroundColor: `${strainColor}22`,
              }}
            >
              {getStrainLabel(workout.strain)} · {workout.strain.toFixed(1)}
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div>
              <p className="text-xs text-bear-subtle">Avg HR</p>
              <p className="font-bold text-bear-heart">{workout.avgHR} bpm</p>
            </div>
            <div>
              <p className="text-xs text-bear-subtle">Max HR</p>
              <p className="font-bold">{workout.maxHR} bpm</p>
            </div>
            <div>
              <p className="text-xs text-bear-subtle">Calories</p>
              <p className="font-bold text-bear-warning">{workout.calories} kcal</p>
            </div>
            <div>
              <p className="text-xs text-bear-subtle">Strain</p>
              <p className="font-bold" style={{ color: strainColor }}>
                {workout.strain.toFixed(1)} / 21
              </p>
            </div>
          </div>

          {/* HR effort bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-bear-subtle mb-1">
              <span>Heart rate effort</span>
              <span>{maxHRPct}%</span>
            </div>
            <div className="h-1.5 bg-bear-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${maxHRPct}%`,
                  backgroundColor: strainColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrainGauge({ value }: { value: number }) {
  const zones = [
    { label: "Light", range: "0-7", color: "#22c55e", width: 33 },
    { label: "Moderate", range: "7-11", color: "#3b82f6", width: 20 },
    { label: "High", range: "11-15", color: "#f59e0b", width: 20 },
    { label: "Extreme", range: "15-21", color: "#ef4444", width: 27 },
  ];
  const pct = (value / 21) * 100;

  return (
    <div className="mt-4">
      <div className="relative h-3 rounded-full overflow-hidden flex gap-0.5">
        {zones.map((z) => (
          <div
            key={z.label}
            className="h-full rounded-sm"
            style={{ width: `${z.width}%`, backgroundColor: z.color, opacity: 0.4 }}
          />
        ))}
        {/* Needle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white rounded-full shadow-lg"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-bear-subtle mt-2">
        {zones.map((z) => (
          <span key={z.label}>{z.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const totalCalories = workouts.slice(0, 5).reduce((s, w) => s + w.calories, 0);
  const totalMinutes = workouts.slice(0, 5).reduce((s, w) => s + w.duration, 0);
  const avgHR = Math.round(
    workouts.slice(0, 5).reduce((s, w) => s + w.avgHR, 0) / 5
  );

  // Weekly strain data
  const weeklyStrain = last30Days.slice(-7).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    strain: d.strain,
    color: getStrainColor(d.strain),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Activity & Strain</h1>
          <p className="text-bear-subtle text-sm mt-1">Training load & workout history</p>
        </div>
      </div>

      {/* Today's strain */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-strain">
          <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle self-start mb-4">
            Today&apos;s Strain
          </span>
          <MetricRing
            value={today.strain}
            max={21}
            size={160}
            strokeWidth={14}
            color={getStrainColor(today.strain)}
            label="/ 21"
            sublabel={getStrainLabel(today.strain)}
          />
          <StrainGauge value={today.strain} />
        </div>

        {/* Stat cards */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            label="Weekly Workouts"
            value={5}
            icon={Activity}
            iconColor="#3b82f6"
            subtitle="this week"
            trend={25}
          />
          <StatCard
            label="Total Active Time"
            value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            icon={Clock}
            iconColor="#00d4aa"
            subtitle="last 5 workouts"
          />
          <StatCard
            label="Total Calories"
            value={totalCalories.toLocaleString()}
            unit="kcal"
            icon={Flame}
            iconColor="#f59e0b"
            subtitle="last 5 workouts"
            trend={8}
          />
          <StatCard
            label="Avg Heart Rate"
            value={avgHR}
            unit="bpm"
            icon={Heart}
            iconColor="#ff4d6d"
            subtitle="during workouts"
          />
        </div>
      </div>

      {/* Weekly strain bars */}
      <div className="bg-bear-card border border-bear-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-sm">Weekly Strain Overview</h3>
            <p className="text-bear-subtle text-xs mt-0.5">Training load by day</p>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-bear-warning" />
            <span className="text-sm font-medium">
              Weekly avg:{" "}
              <span className="text-bear-strain">
                {(weeklyStrain.reduce((s, d) => s + d.strain, 0) / 7).toFixed(1)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-28">
          {weeklyStrain.map((d) => {
            const heightPct = (d.strain / 21) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium" style={{ color: d.color }}>
                  {d.strain.toFixed(0)}
                </span>
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${heightPct}%`,
                  backgroundColor: d.color,
                  opacity: 0.8,
                  minHeight: 4,
                }} />
                <span className="text-xs text-bear-subtle">{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent workouts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Workouts</h3>
          <span className="text-xs text-bear-subtle">{workouts.length} workouts logged</span>
        </div>
        <div className="space-y-3">
          {workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </div>
    </div>
  );
}
