import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getOrders, saveOrders, getProducts, saveProducts } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = body.status as OrderStatus;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const orders = await getOrders();
  const order = orders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Cancelling an order returns its items to stock (once).
  if (status === "cancelled" && order.status !== "cancelled") {
    const products = await getProducts();
    for (const item of order.items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (p) p.stock += item.qty;
    }
    await saveProducts(products);
  }

  order.status = status;
  await saveOrders(orders);
  return NextResponse.json({ ok: true, order });
}
