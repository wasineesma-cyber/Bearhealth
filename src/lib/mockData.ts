export interface SleepData {
  score: number;
  duration: number;
  efficiency: number;
  rem: number;
  deep: number;
  light: number;
  awake: number;
  latency: number;
  disturbances: number;
}

export interface DailyMetric {
  date: string;
  recovery: number;
  strain: number;
  sleep: SleepData;
  hrv: number;
  restingHR: number;
  spo2: number;
  respiratoryRate: number;
  calories: number;
  steps: number;
}

export interface HourlyHR {
  time: string;
  bpm: number;
  zone: "rest" | "light" | "moderate" | "vigorous" | "peak";
}

export interface Workout {
  id: string;
  name: string;
  emoji: string;
  date: string;
  startTime: string;
  duration: number;
  strain: number;
  avgHR: number;
  maxHR: number;
  calories: number;
  category: string;
}

export interface SleepStage {
  time: string;
  stage: "awake" | "light" | "deep" | "rem";
  duration: number;
}

// Generate 30 days of mock data
function generateDailyMetrics(): DailyMetric[] {
  const data: DailyMetric[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const recovery = Math.round(30 + Math.random() * 65);
    const sleepDuration = 5.5 + Math.random() * 3.5;
    const sleepEfficiency = Math.round(75 + Math.random() * 20);
    const rem = sleepDuration * (0.18 + Math.random() * 0.07);
    const deep = sleepDuration * (0.12 + Math.random() * 0.08);
    const awake = sleepDuration * (0.03 + Math.random() * 0.07);
    const light = sleepDuration - rem - deep - awake;

    data.push({
      date: date.toISOString().split("T")[0],
      recovery,
      strain: Math.round(8 + Math.random() * 10),
      sleep: {
        score: Math.round(60 + Math.random() * 35),
        duration: Math.round(sleepDuration * 10) / 10,
        efficiency: sleepEfficiency,
        rem: Math.round(rem * 10) / 10,
        deep: Math.round(deep * 10) / 10,
        light: Math.round(light * 10) / 10,
        awake: Math.round(awake * 10) / 10,
        latency: Math.round(5 + Math.random() * 25),
        disturbances: Math.round(Math.random() * 8),
      },
      hrv: Math.round(45 + Math.random() * 55),
      restingHR: Math.round(48 + Math.random() * 20),
      spo2: Math.round(955 + Math.random() * 40) / 10,
      respiratoryRate: Math.round(130 + Math.random() * 30) / 10,
      calories: Math.round(1800 + Math.random() * 800),
      steps: Math.round(4000 + Math.random() * 10000),
    });
  }

  // Make today's data more controlled
  data[29] = {
    ...data[29],
    recovery: 74,
    strain: 13,
    hrv: 68,
    restingHR: 52,
    spo2: 98.2,
    respiratoryRate: 14.8,
    steps: 8432,
    calories: 2345,
    sleep: {
      score: 81,
      duration: 7.4,
      efficiency: 91,
      rem: 1.8,
      deep: 1.2,
      light: 4.1,
      awake: 0.3,
      latency: 9,
      disturbances: 2,
    },
  };

  return data;
}

// Generate hourly heart rate for today
function generateHourlyHR(): HourlyHR[] {
  const hours: HourlyHR[] = [];
  const zones = [
    { min: 48, max: 62, zone: "rest" as const },
    { min: 62, max: 90, zone: "light" as const },
    { min: 90, max: 130, zone: "moderate" as const },
    { min: 130, max: 160, zone: "vigorous" as const },
    { min: 160, max: 185, zone: "peak" as const },
  ];

  const pattern = [
    52, 50, 49, 48, 49, 51, 54, 62, 75, 82, 88, 95, 145, 162, 155, 148, 110,
    85, 78, 82, 79, 74, 68, 64,
  ];

  for (let h = 0; h < 24; h++) {
    const bpm =
      pattern[h] + Math.round((Math.random() - 0.5) * 8);
    const zone =
      bpm < 62
        ? "rest"
        : bpm < 90
          ? "light"
          : bpm < 130
            ? "moderate"
            : bpm < 160
              ? "vigorous"
              : "peak";

    hours.push({
      time: `${h.toString().padStart(2, "0")}:00`,
      bpm,
      zone,
    });
  }

  return hours;
}

// Generate sleep stages for last night
function generateSleepStages(): SleepStage[] {
  return [
    { time: "22:30", stage: "light", duration: 25 },
    { time: "22:55", stage: "deep", duration: 40 },
    { time: "23:35", stage: "light", duration: 20 },
    { time: "23:55", stage: "rem", duration: 30 },
    { time: "00:25", stage: "light", duration: 15 },
    { time: "00:40", stage: "awake", duration: 5 },
    { time: "00:45", stage: "light", duration: 20 },
    { time: "01:05", stage: "deep", duration: 35 },
    { time: "01:40", stage: "light", duration: 25 },
    { time: "02:05", stage: "rem", duration: 40 },
    { time: "02:45", stage: "light", duration: 15 },
    { time: "03:00", stage: "deep", duration: 30 },
    { time: "03:30", stage: "light", duration: 20 },
    { time: "03:50", stage: "rem", duration: 35 },
    { time: "04:25", stage: "light", duration: 20 },
    { time: "04:45", stage: "awake", duration: 3 },
    { time: "04:48", stage: "light", duration: 25 },
    { time: "05:13", stage: "rem", duration: 45 },
    { time: "05:58", stage: "light", duration: 30 },
    { time: "06:28", stage: "awake", duration: 2 },
  ];
}

// Workouts
export const workouts: Workout[] = [
  {
    id: "1",
    name: "Morning Run",
    emoji: "🏃",
    date: new Date().toISOString().split("T")[0],
    startTime: "06:30",
    duration: 42,
    strain: 13.2,
    avgHR: 148,
    maxHR: 174,
    calories: 412,
    category: "Running",
  },
  {
    id: "2",
    name: "Weight Training",
    emoji: "💪",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    startTime: "18:15",
    duration: 65,
    strain: 10.8,
    avgHR: 128,
    maxHR: 158,
    calories: 380,
    category: "Strength",
  },
  {
    id: "3",
    name: "Cycling",
    emoji: "🚴",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    startTime: "07:00",
    duration: 75,
    strain: 15.4,
    avgHR: 155,
    maxHR: 181,
    calories: 620,
    category: "Cycling",
  },
  {
    id: "4",
    name: "Yoga",
    emoji: "🧘",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    startTime: "07:30",
    duration: 55,
    strain: 5.2,
    avgHR: 88,
    maxHR: 112,
    calories: 180,
    category: "Mind & Body",
  },
  {
    id: "5",
    name: "HIIT",
    emoji: "⚡",
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    startTime: "06:45",
    duration: 30,
    strain: 17.1,
    avgHR: 168,
    maxHR: 188,
    calories: 340,
    category: "HIIT",
  },
];

export const dailyMetrics = generateDailyMetrics();
export const today = dailyMetrics[dailyMetrics.length - 1];
export const yesterday = dailyMetrics[dailyMetrics.length - 2];
export const last7Days = dailyMetrics.slice(-7);
export const last30Days = dailyMetrics;
export const hourlyHR = generateHourlyHR();
export const sleepStages = generateSleepStages();

export function getRecoveryColor(score: number): string {
  if (score >= 67) return "#00d4aa";
  if (score >= 34) return "#f59e0b";
  return "#ef4444";
}

export function getRecoveryLabel(score: number): string {
  if (score >= 67) return "Optimal";
  if (score >= 34) return "Moderate";
  return "Low";
}

export function getStrainColor(strain: number): string {
  if (strain <= 7) return "#22c55e";
  if (strain <= 11) return "#3b82f6";
  if (strain <= 15) return "#f59e0b";
  return "#ef4444";
}

export function getStrainLabel(strain: number): string {
  if (strain <= 7) return "Light";
  if (strain <= 11) return "Moderate";
  if (strain <= 15) return "High";
  return "Extreme";
}
