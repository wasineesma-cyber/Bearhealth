import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getShops, saveShops, uid, slugify } from "@/lib/store";
import type { Shop } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const shops = await getShops();
  let slug = slugify(name);
  // ensure unique slug
  let i = 2;
  const base = slug;
  while (shops.some((s) => s.slug === slug)) slug = `${base}-${i++}`;

  const shop: Shop = {
    id: uid(),
    slug,
    name,
    description: String(body.description || "").trim(),
    promptpayId: String(body.promptpayId || "").trim(),
    promptpayName: String(body.promptpayName || "").trim(),
    shippingNote: String(body.shippingNote || "").trim(),
    active: body.active !== false,
    order: shops.length,
    createdAt: new Date().toISOString(),
  };
  shops.push(shop);
  await saveShops(shops);
  return NextResponse.json({ ok: true, shop });
}
