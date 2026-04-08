"use client";

import {
  Heart,
  Wind,
  Flame,
  Footprints,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Wifi,
  WifiOff,
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
import { useGarminData } from "@/hooks/useGarminData";
import { useLang } from "@/hooks/useLang";

function TrendIcon({ value, prev }: { value: number; prev: number }) {
  const diff = value - prev;
  if (diff > 0) return <TrendingUp size={14} className="text-bear-recovery" />;
  if (diff < 0) return <TrendingDown size={14} className="text-bear-danger" />;
  return <Minus size={14} className="text-bear-subtle" />;
}

export default function Dashboard() {
  const { t, lang } = useLang();
  const { data: garmin, loading, error, synced, refetch } = useGarminData();

  // Merge Garmin live data over mock data where available
  const restingHR = garmin?.heartRate?.restingHR ?? today.restingHR;
  const steps = garmin?.steps ?? today.steps;
  const sleepScore = garmin?.sleep?.score ?? today.sleep.score;
  const sleepDuration = garmin?.sleep?.duration ?? today.sleep.duration;
  const sleepEfficiency = today.sleep.efficiency;
  const hrValues =
    garmin?.heartRate?.values && garmin.heartRate.values.length > 0
      ? garmin.heartRate.values
      : hourlyHR;

  const recoveryColor = getRecoveryColor(today.recovery);
  const strainColor = getStrainColor(today.strain);

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const greeting = `${t.dashboard.greeting}, Wasinee`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{greeting}</h1>
          <p className="text-bear-subtle text-sm mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Garmin sync button */}
          {loading ? (
            <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2">
              <RefreshCw size={14} className="text-bear-subtle animate-spin" />
              <span className="text-sm text-bear-subtle">{t.garmin.connecting}</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 bg-bear-card border border-red-900/40 rounded-xl px-4 py-2">
              <WifiOff size={14} className="text-bear-danger" />
              <span className="text-sm text-bear-danger">{t.garmin.demoData}</span>
              <button
                onClick={refetch}
                className="text-xs text-bear-subtle hover:text-bear-text ml-1 transition-colors"
              >
                {t.garmin.retry}
              </button>
            </div>
          ) : synced ? (
            <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2">
              <Wifi size={14} className="text-bear-recovery" />
              <span className="text-sm font-medium">{t.garmin.liveData}</span>
            </div>
          ) : (
            <button
              onClick={refetch}
              className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2 hover:border-bear-recovery transition-colors"
            >
              <RefreshCw size={14} className="text-bear-subtle" />
              <span className="text-sm text-bear-subtle">Sync Garmin</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Score Rings */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Recovery */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-recovery">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              {t.dashboard.recovery}
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={today.recovery} prev={yesterday.recovery} />
              <span>{t.dashboard.vsYesterday}</span>
            </div>
          </div>
          <MetricRing
            value={today.recovery}
            max={100}
            size={168}
            strokeWidth={14}
            color={recoveryColor}
            label={t.dashboard.recovery.toLowerCase()}
            sublabel={getRecoveryLabel(today.recovery, t)}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{today.hrv}</p>
              <p className="text-xs text-bear-subtle">{t.dashboard.hrv} ms</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{restingHR}</p>
              <p className="text-xs text-bear-subtle">{t.dashboard.restingHR}</p>
            </div>
          </div>
        </div>

        {/* Strain */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-strain">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              {t.dashboard.strain}
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={today.strain} prev={yesterday.strain} />
              <span>{t.dashboard.vsYesterday}</span>
            </div>
          </div>
          <MetricRing
            value={today.strain}
            max={21}
            size={168}
            strokeWidth={14}
            color={strainColor}
            label="/ 21"
            sublabel={getStrainLabel(today.strain, t)}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{today.calories.toLocaleString()}</p>
              <p className="text-xs text-bear-subtle">{t.dashboard.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{steps.toLocaleString()}</p>
              <p className="text-xs text-bear-subtle">{t.dashboard.steps}</p>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-sleep">
          <div className="flex items-center gap-2 self-start mb-4 w-full justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">
              {t.dashboard.sleep}
            </span>
            <div className="flex items-center gap-1 text-xs text-bear-subtle">
              <TrendIcon value={sleepScore ?? 0} prev={yesterday.sleep.score} />
              <span>{t.dashboard.vsYesterday}</span>
            </div>
          </div>
          <MetricRing
            value={sleepScore ?? 0}
            max={100}
            size={168}
            strokeWidth={14}
            color="#8b5cf6"
            label={t.sleep.sleepScore.toLowerCase()}
            sublabel={
              (sleepScore ?? 0) >= 75
                ? t.sleep.restorative
                : (sleepScore ?? 0) >= 50
                  ? t.sleep.adequate
                  : t.sleep.poor
            }
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold">{sleepDuration}{t.common.hrs}</p>
              <p className="text-xs text-bear-subtle">{t.sleep.duration}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{sleepEfficiency}%</p>
              <p className="text-xs text-bear-subtle">{t.sleep.efficiency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t.metrics.spo2}
          value={today.spo2}
          unit="%"
          icon={Heart}
          iconColor="#3b82f6"
          trend={0.2}
          subtitle={t.metrics.normalRange}
        />
        <StatCard
          label={t.metrics.respiratoryRate}
          value={today.respiratoryRate}
          unit={t.metrics.perMin}
          icon={Wind}
          iconColor="#00d4aa"
          trend={-0.8}
          subtitle={t.metrics.vsBaseline}
        />
        <StatCard
          label={t.metrics.activeCalories}
          value={today.calories.toLocaleString()}
          unit={t.common.kcal}
          icon={Flame}
          iconColor="#f59e0b"
          trend={12}
          subtitle={t.metrics.aboveTarget}
        />
        <StatCard
          label={t.metrics.steps}
          value={steps.toLocaleString()}
          icon={Footprints}
          iconColor="#8b5cf6"
          trend={-5}
          subtitle={`${t.metrics.goal}: 10,000`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <HRVChart data={last30Days} days={14} t={t} />
        <HeartRateChart data={hrValues as typeof hourlyHR} t={t} />
      </div>

      {/* Recent Workouts */}
      <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{t.dashboard.recentActivity}</h3>
          <a href="/activity" className="text-xs text-bear-strain hover:text-blue-400 transition-colors">
            {t.dashboard.viewAll}
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
                  {w.startTime} · {w.duration}{t.common.min}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: getStrainColor(w.strain) }}>
                  {w.strain.toFixed(1)}
                </p>
                <p className="text-xs text-bear-subtle">strain</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-bear-heart">{w.avgHR}</p>
                <p className="text-xs text-bear-subtle">{t.dashboard.avgBPM}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-bear-warning">{w.calories}</p>
                <p className="text-xs text-bear-subtle">{t.common.kcal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
