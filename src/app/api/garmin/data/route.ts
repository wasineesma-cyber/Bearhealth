import { NextResponse } from "next/server";
import { getHeartRate, getSleep, getSteps, getUserProfile } from "@/lib/garmin";

export async function GET() {
  try {
    // Fetch in parallel
    const [heartRate, sleep, steps, profile] = await Promise.allSettled([
      getHeartRate(),
      getSleep(),
      getSteps(),
      getUserProfile(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        heartRate: heartRate.status === "fulfilled" ? heartRate.value : null,
        sleep: sleep.status === "fulfilled" ? sleep.value : null,
        steps: steps.status === "fulfilled" ? steps.value : null,
        profile: profile.status === "fulfilled" ? profile.value : null,
      },
      errors: {
        heartRate: heartRate.status === "rejected" ? heartRate.reason?.message : null,
        sleep: sleep.status === "rejected" ? sleep.reason?.message : null,
        steps: steps.status === "rejected" ? steps.reason?.message : null,
        profile: profile.status === "rejected" ? profile.reason?.message : null,
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
