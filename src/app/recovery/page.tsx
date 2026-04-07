import {
  Heart,
  Activity,
  Wind,
  Droplets,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import MetricRing from "@/components/MetricRing";
import StatCard from "@/components/StatCard";
import HRVChart from "@/components/charts/HRVChart";
import RecoveryTrendChart from "@/components/charts/RecoveryTrendChart";
import {
  today,
  yesterday,
  last30Days,
  getRecoveryColor,
  getRecoveryLabel,
} from "@/lib/mockData";

function RecoveryFactor({
  label,
  value,
  baseline,
  unit,
  positive,
}: {
  label: string;
  value: number;
  baseline: number;
  unit: string;
  positive: boolean;
}) {
  const diff = value - baseline;
  const isGood = positive ? diff >= 0 : diff <= 0;
  const color = isGood ? "#00d4aa" : "#ef4444";
  const pct = Math.abs(Math.round((diff / baseline) * 100));

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-bear-subtle mt-0.5">
          Baseline: {baseline}
          {unit}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">
          {value}
          <span className="text-xs text-bear-subtle ml-1 font-normal">{unit}</span>
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {diff > 0 ? (
            <TrendingUp size={11} style={{ color }} />
          ) : (
            <TrendingDown size={11} style={{ color }} />
          )}
          <span className="text-xs font-medium" style={{ color }}>
            {pct > 0 ? `${pct}%` : "on baseline"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  const recoveryColor = getRecoveryColor(today.recovery);
  const recoveryLabel = getRecoveryLabel(today.recovery);

  const recoveryFactors = [
    {
      label: "HRV",
      value: today.hrv,
      baseline: 62,
      unit: "ms",
      positive: true,
    },
    {
      label: "Resting Heart Rate",
      value: today.restingHR,
      baseline: 54,
      unit: "bpm",
      positive: false,
    },
    {
      label: "SpO2",
      value: today.spo2,
      baseline: 97.5,
      unit: "%",
      positive: true,
    },
    {
      label: "Respiratory Rate",
      value: today.respiratoryRate,
      baseline: 15.2,
      unit: "br/min",
      positive: false,
    },
    {
      label: "Sleep Quality",
      value: today.sleep.score,
      baseline: 72,
      unit: "",
      positive: true,
    },
  ];

  // Score interpretation
  const interpretation =
    today.recovery >= 67
      ? {
          text: "Your body is fully recovered and ready for high-intensity training. Take advantage of this recovery window to push your limits.",
          action: "Push hard today — consider a HIIT session or long run.",
        }
      : today.recovery >= 34
        ? {
            text: "Moderate recovery. Your body is managing but could benefit from lighter activity. Focus on technique over intensity.",
            action: "Moderate training is fine. Prioritize sleep tonight.",
          }
        : {
            text: "Low recovery. Your body needs rest. Overtraining now may lead to injury or illness. Prioritize recovery activities.",
            action: "Rest day or light yoga/walking only.",
          };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Recovery</h1>
          <p className="text-bear-subtle text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Recovery ring */}
        <div
          className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center"
          style={{ boxShadow: `0 0 40px ${recoveryColor}15` }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle self-start mb-4">
            Recovery Score
          </span>
          <MetricRing
            value={today.recovery}
            max={100}
            size={180}
            strokeWidth={16}
            color={recoveryColor}
            label="recovery"
            sublabel={recoveryLabel}
          />
          <div className="mt-5 p-3 rounded-xl w-full" style={{ backgroundColor: `${recoveryColor}15` }}>
            <p className="text-xs leading-relaxed" style={{ color: recoveryColor }}>
              {interpretation.action}
            </p>
          </div>
        </div>

        {/* Recovery factors */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-sm">Recovery Factors</h3>
            <Info size={14} className="text-bear-subtle" />
          </div>
          <div className="space-y-1 divide-y divide-bear-border/50">
            {recoveryFactors.map((f) => (
              <RecoveryFactor key={f.label} {...f} />
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Today&apos;s Insights</h3>
          <div className="space-y-3">
            <p className="text-sm text-bear-subtle leading-relaxed">
              {interpretation.text}
            </p>

            <div className="pt-3 border-t border-bear-border">
              <p className="text-xs text-bear-subtle uppercase tracking-wider mb-3 font-medium">
                Key Metrics
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-3 rounded-xl text-center"
                  style={{ backgroundColor: `${recoveryColor}18` }}
                >
                  <p className="text-xl font-bold" style={{ color: recoveryColor }}>
                    {today.hrv}
                  </p>
                  <p className="text-xs text-bear-subtle">HRV (ms)</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-bear-muted/30">
                  <p className="text-xl font-bold text-bear-heart">{today.restingHR}</p>
                  <p className="text-xs text-bear-subtle">Resting HR</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-bear-muted/30">
                  <p className="text-xl font-bold text-bear-strain">{today.spo2}%</p>
                  <p className="text-xs text-bear-subtle">SpO2</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-bear-muted/30">
                  <p className="text-xl font-bold text-bear-recovery">
                    {today.respiratoryRate}
                  </p>
                  <p className="text-xs text-bear-subtle">Resp Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <HRVChart data={last30Days} days={14} />
        <RecoveryTrendChart data={last30Days} days={14} />
      </div>
    </div>
  );
}
