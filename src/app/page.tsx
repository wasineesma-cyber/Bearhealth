"use client";

import { Heart, Wind, Flame, Footprints, RefreshCw, Wifi, WifiOff } from "lucide-react";
import MetricRing from "@/components/MetricRing";
import StatCard from "@/components/StatCard";
import HeartRateChart from "@/components/charts/HeartRateChart";
import { useGarminData } from "@/hooks/useGarminData";
import { useLang } from "@/hooks/useLang";

function Val({ v, unit }: { v: number | null | undefined; unit?: string }) {
  if (v == null) return <span className="text-bear-subtle">--</span>;
  return <>{v.toLocaleString()}{unit && <span className="text-bear-subtle text-sm ml-0.5">{unit}</span>}</>;
}

export default function Dashboard() {
  const { t, lang } = useLang();
  const { data: g, loading, error, synced, refetch } = useGarminData();

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  // Body battery → recovery (0–100)
  const recovery = g?.bodyBattery?.current ?? null;
  // Stress avg → map to 0–21 strain scale
  const strainRaw = g?.stress?.avg ?? null;
  const strain = strainRaw != null ? Math.round((strainRaw / 100) * 21 * 10) / 10 : null;
  const sleepScore = g?.sleep?.score ?? null;
  const restingHR = g?.heartRate?.restingHR ?? null;
  const hrv = g?.hrv?.lastNight ?? null;
  const steps = g?.steps ?? null;
  const hrValues = g?.heartRate?.values ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">สวัสดี, Wasinee</h1>
          <p className="text-bear-subtle text-sm mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2">
              <RefreshCw size={14} className="text-bear-subtle animate-spin" />
              <span className="text-sm text-bear-subtle">กำลังโหลด...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 bg-bear-card border border-red-900/40 rounded-xl px-4 py-2">
              <WifiOff size={14} className="text-bear-danger" />
              <span className="text-sm text-bear-danger">เชื่อมต่อไม่ได้</span>
              <button onClick={refetch} className="text-xs text-bear-subtle hover:text-bear-text ml-1">ลองใหม่</button>
            </div>
          ) : synced ? (
            <div className="flex items-center gap-2 bg-bear-card border border-bear-border rounded-xl px-4 py-2">
              <Wifi size={14} className="text-bear-recovery" />
              <span className="text-sm font-medium">ข้อมูลจริงจาก Garmin</span>
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
        {/* Recovery / Body Battery */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-recovery">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">Body Battery</span>
          </div>
          <MetricRing
            value={recovery ?? 0}
            max={100}
            size={168}
            strokeWidth={14}
            color="#00d4aa"
            label="battery"
            sublabel={recovery == null ? "ไม่มีข้อมูล" : recovery >= 75 ? "พลังงานสูง" : recovery >= 40 ? "ปานกลาง" : "พลังงานต่ำ"}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={hrv} unit=" ms" /></p>
              <p className="text-xs text-bear-subtle">HRV</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={restingHR} /></p>
              <p className="text-xs text-bear-subtle">ชีพจรพัก</p>
            </div>
          </div>
        </div>

        {/* Strain / Stress */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-strain">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">Stress / Strain</span>
          </div>
          <MetricRing
            value={strain ?? 0}
            max={21}
            size={168}
            strokeWidth={14}
            color="#f59e0b"
            label="/ 21"
            sublabel={strainRaw == null ? "ไม่มีข้อมูล" : strainRaw >= 76 ? "สูงมาก" : strainRaw >= 51 ? "สูง" : strainRaw >= 26 ? "ปานกลาง" : "ต่ำ"}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={g?.stress?.avg} /></p>
              <p className="text-xs text-bear-subtle">Stress เฉลี่ย</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={g?.stress?.max} /></p>
              <p className="text-xs text-bear-subtle">Stress สูงสุด</p>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-bear-card border border-bear-border rounded-2xl p-6 flex flex-col items-center card-glow-sleep">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-bear-subtle">การนอนหลับ</span>
          </div>
          <MetricRing
            value={sleepScore ?? 0}
            max={100}
            size={168}
            strokeWidth={14}
            color="#8b5cf6"
            label="คะแนน"
            sublabel={sleepScore == null ? "ไม่มีข้อมูล" : sleepScore >= 75 ? "นอนหลับดี" : sleepScore >= 50 ? "พอใช้" : "นอนน้อย"}
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={g?.sleep?.duration} unit=" ชม." /></p>
              <p className="text-xs text-bear-subtle">ระยะเวลา</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold"><Val v={g?.sleep?.deep} unit=" ชม." /></p>
              <p className="text-xs text-bear-subtle">หลับลึก</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="SpO2" value={null} unit="%" icon={Heart} iconColor="#3b82f6" subtitle="ไม่มีข้อมูล" />
        <StatCard label="การหายใจ" value={g?.sleep?.respiratoryRate ?? null} unit=" /นาที" icon={Wind} iconColor="#00d4aa" subtitle="ขณะนอน" />
        <StatCard label="ก้าวเดิน" value={steps} icon={Footprints} iconColor="#8b5cf6" subtitle="วันนี้" />
        <StatCard label="REM Sleep" value={g?.sleep?.rem ?? null} unit=" ชม." icon={Flame} iconColor="#f59e0b" subtitle="การนอน REM" />
      </div>

      {/* HR Chart */}
      {hrValues.length > 0 && (
        <div className="mb-6">
          <HeartRateChart data={hrValues} t={t} />
        </div>
      )}

      {/* No data state */}
      {!synced && !loading && (
        <div className="bg-bear-card border border-bear-border rounded-2xl p-8 text-center">
          <p className="text-bear-subtle text-sm">กด Sync Garmin เพื่อโหลดข้อมูลจริงจากนาฬิกาค่ะ</p>
        </div>
      )}
    </div>
  );
}
