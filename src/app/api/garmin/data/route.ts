import { NextResponse } from "next/server";
import {
  getHeartRate,
  getSleep,
  getSteps,
  getUserProfile,
  getBodyBattery,
  getDailyStress,
  getHrv,
} from "@/lib/garmin";

export async function GET() {
  try {
    const [heartRate, sleep, steps, profile, bodyBattery, stress, hrv] =
      await Promise.allSettled([
        getHeartRate(),
        getSleep(),
        getSteps(),
        getUserProfile(),
        getBodyBattery(),
        getDailyStress(),
        getHrv(),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        heartRate: heartRate.status === "fulfilled" ? heartRate.value : null,
        sleep: sleep.status === "fulfilled" ? sleep.value : null,
        steps: steps.status === "fulfilled" ? steps.value : null,
        profile: profile.status === "fulfilled" ? profile.value : null,
        bodyBattery: bodyBattery.status === "fulfilled" ? bodyBattery.value : null,
        stress: stress.status === "fulfilled" ? stress.value : null,
        hrv: hrv.status === "fulfilled" ? hrv.value : null,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to connect to Garmin" },
      { status: 500 }
    );
  }
}
