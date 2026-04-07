import { NextResponse } from "next/server";
import { getActivities } from "@/lib/garmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 50);

  try {
    const activities = await getActivities(limit);
    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
