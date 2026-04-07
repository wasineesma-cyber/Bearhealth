"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HourlyHR } from "@/lib/mockData";

interface HeartRateChartProps {
  data: HourlyHR[];
}

const zoneColors: Record<string, string> = {
  rest: "#888",
  light: "#22c55e",
  moderate: "#3b82f6",
  vigorous: "#f59e0b",
  peak: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const zone = payload[0].payload.zone;
    const color = zoneColors[zone] || "#888";
    return (
      <div className="custom-tooltip">
        <p className="text-bear-subtle text-xs mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>
          {payload[0].value}{" "}
          <span className="text-bear-subtle font-normal text-xs">bpm</span>
        </p>
        <p className="text-xs capitalize mt-0.5" style={{ color }}>
          {zone} zone
        </p>
      </div>
    );
  }
  return null;
};

export default function HeartRateChart({ data }: HeartRateChartProps) {
  const max = Math.max(...data.map((d) => d.bpm));
  const avg = Math.round(data.reduce((s, d) => s + d.bpm, 0) / data.length);

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Heart Rate Today</h3>
          <p className="text-bear-subtle text-xs mt-0.5">24-hour overview</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xl font-bold text-bear-heart">{max}</p>
            <p className="text-bear-subtle text-xs">peak bpm</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{avg}</p>
            <p className="text-bear-subtle text-xs">avg bpm</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={5}
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[40, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avg} stroke="#3a3a3a" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="bpm"
            stroke="#ff4d6d"
            strokeWidth={2}
            fill="url(#hrGradient)"
            dot={false}
            activeDot={{ r: 5, fill: "#ff4d6d", stroke: "#0d0d0d", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Zone legend */}
      <div className="flex gap-3 mt-3 flex-wrap">
        {Object.entries(zoneColors).map(([zone, color]) => (
          <div key={zone} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-bear-subtle capitalize">{zone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
