import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import {
  getShops, saveShops,
  getCategories, saveCategories,
  getProducts, saveProducts,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const shops = await getShops();
  const shop = shops.find((s) => s.id === params.id);
  if (!shop) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (typeof body.name === "string" && body.name.trim()) shop.name = body.name.trim();
  if (typeof body.description === "string") shop.description = body.description.trim();
  if (typeof body.promptpayId === "string") shop.promptpayId = body.promptpayId.trim();
  if (typeof body.promptpayName === "string") shop.promptpayName = body.promptpayName.trim();
  if (typeof body.shippingNote === "string") shop.shippingNote = body.shippingNote.trim();
  if (typeof body.active === "boolean") shop.active = body.active;
  if (typeof body.order === "number") shop.order = body.order;

  await saveShops(shops);
  return NextResponse.json({ ok: true, shop });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const shops = await getShops();
  const next = shops.filter((s) => s.id !== params.id);
  if (next.length === shops.length) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await saveShops(next);

  // cascade: remove this shop's categories & products (orders kept for history)
  const cats = await getCategories();
  await saveCategories(cats.filter((c) => c.shopId !== params.id));
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.shopId !== params.id));

  return NextResponse.json({ ok: true });
}
