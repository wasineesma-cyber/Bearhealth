"use client";

import { useState, useEffect } from "react";

interface GarminData {
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
  profile: {
    displayName: string;
    fullName: string;
    profileImageUrl: string | null;
  } | null;
}

interface UseGarminDataReturn {
  data: GarminData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGarminData(): UseGarminDataReturn {
  const [data, setData] = useState<GarminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/garmin/data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch Garmin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useGarminActivities(limit = 10) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/garmin/activities?limit=${limit}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setActivities(json.activities);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [limit]);

  return { activities, loading, error };
}
