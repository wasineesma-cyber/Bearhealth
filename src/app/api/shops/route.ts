import { NextResponse } from "next/server";
import { getShops, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: list active shops for the landing page.
export async function GET() {
  const [shops, settings] = await Promise.all([getShops(), getSettings()]);
  return NextResponse.json({
    site: settings,
    shops: shops
      .filter((s) => s.active)
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
      })),
  });
}
