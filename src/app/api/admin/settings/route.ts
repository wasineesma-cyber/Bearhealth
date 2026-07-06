import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getSettings, saveSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const settings = await getSettings();
  if (typeof body.siteName === "string" && body.siteName.trim()) settings.siteName = body.siteName.trim();
  if (typeof body.siteTagline === "string") settings.siteTagline = body.siteTagline.trim();
  await saveSettings(settings);
  return NextResponse.json({ ok: true, settings });
}
