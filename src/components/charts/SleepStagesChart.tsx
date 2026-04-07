"use client";

import { SleepStage } from "@/lib/mockData";

const stageConfig = {
  awake: { color: "#f59e0b", label: "Awake", height: 8 },
  rem: { color: "#8b5cf6", label: "REM", height: 32 },
  light: { color: "#3b82f6", label: "Light", height: 52 },
  deep: { color: "#1d4ed8", label: "Deep", height: 72 },
};

interface SleepStagesChartProps {
  stages: SleepStage[];
  rem: number;
  deep: number;
  light: number;
  awake: number;
}

export default function SleepStagesChart({
  stages,
  rem,
  deep,
  light,
  awake,
}: SleepStagesChartProps) {
  const totalMinutes = stages.reduce((s, st) => s + st.duration, 0);

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Sleep Stages</h3>
          <p className="text-bear-subtle text-xs mt-0.5">Last night breakdown</p>
        </div>
      </div>

      {/* Hypnogram */}
      <div className="relative h-24 mb-4">
        <div className="flex h-full items-end gap-0.5">
          {stages.map((stage, i) => {
            const cfg = stageConfig[stage.stage];
            const widthPct = (stage.duration / totalMinutes) * 100;
            return (
              <div
                key={i}
                className="relative flex flex-col items-center group"
                style={{ width: `${widthPct}%`, height: "100%" }}
              >
                <div
                  className="w-full rounded-sm transition-opacity group-hover:opacity-100"
                  style={{
                    height: `${cfg.height}%`,
                    backgroundColor: cfg.color,
                    opacity: 0.85,
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bear-bg border border-bear-border rounded-lg px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p style={{ color: cfg.color }} className="font-semibold">
                    {cfg.label}
                  </p>
                  <p className="text-bear-subtle">{stage.duration}m</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between pointer-events-none -ml-1">
          {["Awake", "REM", "Light", "Deep"].map((s) => (
            <span key={s} className="text-[9px] text-bear-muted -translate-x-full pr-1">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="grid grid-cols-4 gap-2 mt-5">
        {[
          { label: "REM", value: rem, color: "#8b5cf6" },
          { label: "Deep", value: deep, color: "#1d4ed8" },
          { label: "Light", value: light, color: "#3b82f6" },
          { label: "Awake", value: awake, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <p className="text-lg font-bold" style={{ color }}>
              {value}h
            </p>
            <p className="text-xs text-bear-subtle mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
