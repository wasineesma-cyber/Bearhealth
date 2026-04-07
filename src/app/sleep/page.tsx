import {
  Moon,
  Clock,
  Zap,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react";
import MetricRing from "@/components/MetricRing";
import StatCard from "@/components/StatCard";
import SleepStagesChart from "@/components/charts/SleepStagesChart";
import SleepTrendChart from "@/components/charts/SleepTrendChart";
import { today, last30Days, sleepStages } from "@/lib/mockData";

const sleep = today.sleep;

function SleepInsightCard({
  icon: Icon,
  title,
  description,
  color,
  type,
}: {
  icon: typeof Star;
  title: string;
  description: string;
  color: string;
  type: "good" | "warn" | "info";
}) {
  const bg = type === "good" ? "#00d4aa18" : type === "warn" ? "#f59e0b18" : "#3b82f618";
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: bg }}>
      <Icon size={18} style={{ color }} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-bear-subtle mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function SleepPage() {
  const sleepScore = sleep.score;
  const scoreLabel =
    sleepScore >= 75 ? "Restorative" : sleepScore >= 50 ? "Adequate" : "Poor";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Sleep Analysis</h1>
          <p className="text-bear-subtle text-sm mt-1">
            Last night ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Main sleep metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Score Ring */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-sleep">
          <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle self-start mb-4">
            Sleep Score
          </span>
          <MetricRing
            value={sleepScore}
            max={100}
            size={168}
            strokeWidth={14}
            color="#8b5cf6"
            label="score"
            sublabel={scoreLabel}
          />
          <div className="w-full mt-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-bear-subtle">Duration</span>
              <span className="font-semibold">{sleep.duration}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bear-subtle">Efficiency</span>
              <span className="font-semibold">{sleep.efficiency}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bear-subtle">Latency</span>
              <span className="font-semibold">{sleep.latency} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bear-subtle">Disturbances</span>
              <span className="font-semibold">{sleep.disturbances}x</span>
            </div>
          </div>
        </div>

        {/* Stage breakdown large */}
        <div className="col-span-2">
          <SleepStagesChart
            stages={sleepStages}
            rem={sleep.rem}
            deep={sleep.deep}
            light={sleep.light}
            awake={sleep.awake}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="REM Sleep"
          value={`${sleep.rem}h`}
          icon={Star}
          iconColor="#8b5cf6"
          trend={5}
          subtitle="memory & learning"
        />
        <StatCard
          label="Deep Sleep"
          value={`${sleep.deep}h`}
          icon={Zap}
          iconColor="#1d4ed8"
          trend={-8}
          subtitle="physical recovery"
        />
        <StatCard
          label="Sleep Latency"
          value={sleep.latency}
          unit="min"
          icon={Clock}
          iconColor="#00d4aa"
          trend={-15}
          subtitle="time to fall asleep"
        />
        <StatCard
          label="Disturbances"
          value={sleep.disturbances}
          icon={AlertCircle}
          iconColor="#f59e0b"
          subtitle="times woken"
        />
      </div>

      {/* Sleep insights */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Sleep Insights</h3>
          <div className="space-y-3">
            <SleepInsightCard
              icon={Star}
              title="Good REM sleep"
              description={`You got ${sleep.rem}h of REM sleep, supporting memory consolidation and emotional processing.`}
              color="#8b5cf6"
              type="good"
            />
            <SleepInsightCard
              icon={TrendingUp}
              title="Efficiency above 90%"
              description="Your sleep efficiency is excellent — you spent most of your time in bed actually sleeping."
              color="#00d4aa"
              type="good"
            />
            <SleepInsightCard
              icon={Moon}
              title="Optimize deep sleep"
              description="Consider a cooler room temperature and avoiding screens 1h before bed to boost deep sleep further."
              color="#f59e0b"
              type="warn"
            />
          </div>
        </div>

        {/* 14-day sleep trend */}
        <SleepTrendChart data={last30Days} days={14} />
      </div>

      {/* Sleep schedule recommendation */}
      <div className="bg-bear-card border border-bear-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Optimal Sleep Schedule</h3>
        <div className="flex gap-6 items-center">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bear-muted/30 text-center">
              <Moon size={20} className="text-bear-sleep mx-auto mb-2" />
              <p className="text-2xl font-bold">22:30</p>
              <p className="text-xs text-bear-subtle mt-1">Recommended bedtime</p>
            </div>
            <div className="p-4 rounded-xl bg-bear-muted/30 text-center">
              <Zap size={20} className="text-bear-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">06:00</p>
              <p className="text-xs text-bear-subtle mt-1">Wake-up time</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 text-sm text-bear-subtle">
            <p>
              Based on your sleep data, going to bed at{" "}
              <span className="text-bear-text font-medium">10:30 PM</span> and waking at{" "}
              <span className="text-bear-text font-medium">6:00 AM</span> gives you the
              optimal sleep window of 7.5 hours.
            </p>
            <p>
              Your body naturally completes{" "}
              <span className="text-bear-text font-medium">5-6 sleep cycles</span> in this
              window, maximizing recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
