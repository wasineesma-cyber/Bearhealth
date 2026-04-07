"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyMetric } from "@/lib/mockData";

interface HRVChartProps {
  data: DailyMetric[];
  days?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-bear-subtle text-xs mb-1">{label}</p>
        <p className="font-bold text-bear-recovery">
          {payload[0].value} <span className="text-bear-subtle font-normal text-xs">ms HRV</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HRVChart({ data, days = 14 }: HRVChartProps) {
  const chartData = data.slice(-days).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
    hrv: d.hrv,
    recovery: d.recovery,
  }));

  const avg = Math.round(chartData.reduce((s, d) => s + d.hrv, 0) / chartData.length);

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Heart Rate Variability</h3>
          <p className="text-bear-subtle text-xs mt-0.5">Last {days} days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-bear-recovery">{avg}</p>
          <p className="text-bear-subtle text-xs">avg ms</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="hrv"
            stroke="#00d4aa"
            strokeWidth={2.5}
            fill="url(#hrvGradient)"
            dot={false}
            activeDot={{ r: 5, fill: "#00d4aa", stroke: "#0d0d0d", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
