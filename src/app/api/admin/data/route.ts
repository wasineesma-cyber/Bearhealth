import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getShops, getCategories, getProducts, getOrders, getBills, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

// Everything the admin dashboard needs, in one call.
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [shops, categories, products, orders, bills, settings] = await Promise.all([
    getShops(),
    getCategories(),
    getProducts(),
    getOrders(),
    getBills(),
    getSettings(),
  ]);

  return NextResponse.json({ shops, categories, products, orders, bills, settings });
}
