"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DailyMetric } from "@/lib/mockData";

interface SleepTrendChartProps {
  data: DailyMetric[];
  days?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-bear-subtle text-xs mb-1">{label}</p>
        <p className="font-bold text-bear-sleep">
          {payload[0].value}h{" "}
          <span className="text-bear-subtle font-normal text-xs">sleep</span>
        </p>
        {payload[1] && (
          <p className="text-xs text-bear-subtle mt-0.5">
            Score: {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function SleepTrendChart({ data, days = 14 }: SleepTrendChartProps) {
  const chartData = data.slice(-days).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
    hours: d.sleep.duration,
    score: d.sleep.score,
  }));

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Sleep Duration</h3>
          <p className="text-bear-subtle text-xs mt-0.5">Last {days} days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-bear-sleep">
            {(chartData.reduce((s, d) => s + d.hours, 0) / chartData.length).toFixed(1)}h
          </p>
          <p className="text-bear-subtle text-xs">avg/night</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
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
            domain={[0, 10]}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.hours >= 8
                    ? "#8b5cf6"
                    : entry.hours >= 7
                      ? "#6d28d9"
                      : entry.hours >= 6
                        ? "#5b21b6"
                        : "#4c1d95"
                }
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Reference lines legend */}
      <div className="flex gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-bear-sleep" />
          <span className="text-xs text-bear-subtle">8h+ Optimal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#5b21b6" }} />
          <span className="text-xs text-bear-subtle">6-7h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#4c1d95" }} />
          <span className="text-xs text-bear-subtle">&lt;6h</span>
        </div>
      </div>
    </div>
  );
}
