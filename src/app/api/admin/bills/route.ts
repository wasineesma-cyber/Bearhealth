import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getShopById, getProducts, getBills, saveBills, uid, billCode } from "@/lib/store";
import type { Bill, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

// Admin creates a bill by picking products from a shop's stock.
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const shopId = String(body.shopId || "");
  const note = String(body.note || "").trim();
  const lines: { productId: string; qty: number }[] = Array.isArray(body.items) ? body.items : [];

  const shop = await getShopById(shopId);
  if (!shop) return NextResponse.json({ error: "shop_not_found" }, { status: 400 });

  const products = await getProducts();
  const items: OrderItem[] = [];
  let total = 0;

  for (const line of lines) {
    const qty = Math.floor(Number(line.qty) || 0);
    if (qty <= 0) continue;
    const product = products.find((p) => p.id === line.productId && p.shopId === shopId);
    if (!product) continue;
    items.push({ productId: product.id, name: product.name, price: product.price, qty });
    total += product.price * qty;
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "empty_bill" }, { status: 400 });
  }

  const bill: Bill = {
    id: uid(),
    code: billCode(),
    shopId: shop.id,
    shopName: shop.name,
    items,
    total,
    note,
    status: "open",
    orderCode: "",
    createdAt: new Date().toISOString(),
  };

  const bills = await getBills();
  bills.push(bill);
  await saveBills(bills);
  return NextResponse.json({ ok: true, bill });
}
