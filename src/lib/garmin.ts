import { GarminConnect } from "garmin-connect";

// Singleton client (reused across requests in dev mode)
let client: GarminConnect | null = null;
let loggedIn = false;

async function getClient(): Promise<GarminConnect> {
  if (!process.env.GARMIN_EMAIL || !process.env.GARMIN_PASSWORD) {
    throw new Error("GARMIN_EMAIL and GARMIN_PASSWORD must be set in .env.local");
  }

  if (!client) {
    client = new GarminConnect({
      username: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD,
    });
  }

  if (!loggedIn) {
    await client.login();
    loggedIn = true;
  }

  return client;
}

// ── Heart Rate ──────────────────────────────────────────────
export async function getHeartRate(date?: Date) {
  const gc = await getClient();
  const data = await gc.getHeartRate(date ?? new Date());
  return {
    restingHR: (data as any).restingHeartRate ?? null,
    maxHR: (data as any).maxHeartRate ?? null,
    minHR: (data as any).minHeartRate ?? null,
    // hourly readings
    values: ((data as any).heartRateValues ?? []).map(
      ([timestamp, bpm]: [number, number]) => ({
        time: new Date(timestamp).toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        bpm,
      })
    ),
  };
}

// ── Sleep ───────────────────────────────────────────────────
export async function getSleep(date?: Date) {
  const gc = await getClient();
  const data = await gc.getSleepData(date ?? new Date());
  const dto = (data as any).dailySleepDTO;
  if (!dto) return null;

  const toHours = (sec: number) =>
    Math.round((sec / 3600) * 10) / 10;

  return {
    score: dto.sleepScores?.overall?.value ?? null,
    duration: toHours(dto.sleepTimeSeconds ?? 0),
    deep: toHours(dto.deepSleepSeconds ?? 0),
    light: toHours(dto.lightSleepSeconds ?? 0),
    rem: toHours(dto.remSleepSeconds ?? 0),
    awake: toHours(dto.awakeSleepSeconds ?? 0),
    efficiency: dto.sleepScores?.overall?.value ?? null,
    disturbances: dto.awakeCount ?? 0,
    respiratoryRate: dto.averageRespirationValue ?? null,
    stages: ((data as any).sleepMovement ?? []).map((m: any) => ({
      startGMT: m.startGMT,
      endGMT: m.endGMT,
      activityLevel: m.activityLevel,
    })),
  };
}

// ── Steps ───────────────────────────────────────────────────
export async function getSteps(date?: Date) {
  const gc = await getClient();
  return gc.getSteps(date ?? new Date());
}

// ── Activities ──────────────────────────────────────────────
export async function getActivities(limit = 10) {
  const gc = await getClient();
  const raw = await gc.getActivities(0, limit);
  return raw.map((a) => ({
    id: String(a.activityId),
    name: a.activityName,
    date: a.startTimeLocal.split(" ")[0],
    startTime: a.startTimeLocal.split(" ")[1]?.slice(0, 5) ?? "",
    duration: Math.round((a as any).duration / 60),
    avgHR: (a as any).averageHR ?? null,
    maxHR: (a as any).maxHR ?? null,
    calories: Math.round((a as any).calories ?? 0),
    distance: Math.round(((a as any).distance ?? 0) / 10) / 100, // km
    activityType: a.activityType?.typeKey ?? "other",
  }));
}

// ── User profile ────────────────────────────────────────────
export async function getUserProfile() {
  const gc = await getClient();
  const profile = await gc.getUserProfile();
  return {
    displayName: (profile as any).displayName ?? "",
    fullName: (profile as any).fullName ?? "",
    location: (profile as any).location ?? "",
    profileImageUrl: (profile as any).profileImageUrlMedium ?? null,
  };
}
