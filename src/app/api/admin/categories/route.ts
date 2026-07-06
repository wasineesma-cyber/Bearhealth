import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getCategories, saveCategories, getShopById, uid } from "@/lib/store";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const shopId = String(body.shopId || "");
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!(await getShopById(shopId))) {
    return NextResponse.json({ error: "shop_not_found" }, { status: 400 });
  }

  const cats = await getCategories();
  const siblings = cats.filter((c) => c.shopId === shopId);
  const cat: Category = { id: uid(), shopId, name, order: siblings.length };
  cats.push(cat);
  await saveCategories(cats);
  return NextResponse.json({ ok: true, category: cat });
}
