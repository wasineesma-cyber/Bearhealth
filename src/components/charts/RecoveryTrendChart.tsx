"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DailyMetric, getRecoveryColor } from "@/lib/mockData";

interface RecoveryTrendChartProps {
  data: DailyMetric[];
  days?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const recovery = payload[0]?.value;
    const color = getRecoveryColor(recovery);
    return (
      <div className="custom-tooltip">
        <p className="text-bear-subtle text-xs mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>
          {recovery}% <span className="text-bear-subtle font-normal text-xs">recovery</span>
        </p>
        {payload[1] && (
          <p className="text-xs text-bear-strain mt-0.5">
            {payload[1].value} strain
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function RecoveryTrendChart({
  data,
  days = 14,
}: RecoveryTrendChartProps) {
  const chartData = data.slice(-days).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
    recovery: d.recovery,
    strain: d.strain,
  }));

  return (
    <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Recovery & Strain</h3>
          <p className="text-bear-subtle text-xs mt-0.5">Last {days} days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-bear-recovery opacity-60" />
            <span className="text-bear-subtle">Recovery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-bear-strain" />
            <span className="text-bear-subtle">Strain</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="recovery"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <YAxis
            yAxisId="strain"
            orientation="right"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 21]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="recovery" dataKey="recovery" radius={[4, 4, 0, 0]} opacity={0.75}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getRecoveryColor(entry.recovery)} />
            ))}
          </Bar>
          <Line
            yAxisId="strain"
            type="monotone"
            dataKey="strain"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", stroke: "#0d0d0d", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
