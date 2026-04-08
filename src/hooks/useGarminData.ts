"use client";

import { useState, useCallback } from "react";

export interface GarminData {
  heartRate: {
    restingHR: number | null;
    maxHR: number | null;
    values: { time: string; bpm: number }[];
  } | null;
  sleep: {
    score: number | null;
    duration: number;
    deep: number;
    light: number;
    rem: number;
    awake: number;
    disturbances: number;
    respiratoryRate: number | null;
  } | null;
  steps: number | null;
  profile: { displayName: string; fullName: string; profileImageUrl: string | null } | null;
  bodyBattery: { current: number | null; highest: number } | null;
  stress: { avg: number | null; max: number | null } | null;
  hrv: { lastNight: number | null; weeklyAvg: number | null; status: string | null } | null;
}

export function useGarminData() {
  const [data, setData] = useState<GarminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/garmin/data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
      setSynced(true);
    } catch (e: any) {
      setError(e.message ?? "เชื่อมต่อ Garmin ไม่ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, synced, refetch };
}

export function useGarminActivities(limit = 10) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    fetch(`/api/garmin/activities?limit=${limit}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setActivities(json.activities);
        setSynced(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [limit]);

  return { activities, loading, error, synced, refetch };
}
