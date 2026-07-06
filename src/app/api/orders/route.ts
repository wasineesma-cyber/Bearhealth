import { NextResponse } from "next/server";
import {
  getShopBySlug,
  getProducts,
  saveProducts,
  getOrders,
  saveOrders,
  saveMedia,
  uid,
  orderCode,
} from "@/lib/store";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CartLine {
  productId: string;
  qty: number;
}

// Public: create an order from the checkout form (multipart/form-data).
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const shopSlug = String(form.get("shop") || "").trim();
  const customerName = String(form.get("customerName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const address = String(form.get("address") || "").trim();
  const note = String(form.get("note") || "").trim();
  const itemsRaw = String(form.get("items") || "[]");
  const slipFile = form.get("slip");

  if (!customerName || !phone || !address) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const shop = await getShopBySlug(shopSlug);
  if (!shop || !shop.active) {
    return NextResponse.json({ error: "shop_not_found" }, { status: 400 });
  }

  let cart: CartLine[];
  try {
    cart = JSON.parse(itemsRaw);
  } catch {
    return NextResponse.json({ error: "invalid_items" }, { status: 400 });
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const products = await getProducts();
  const items: OrderItem[] = [];
  let total = 0;

  for (const line of cart) {
    const qty = Math.floor(Number(line.qty) || 0);
    if (qty <= 0) continue;
    const product = products.find(
      (p) => p.id === line.productId && p.active && p.shopId === shop.id
    );
    if (!product) {
      return NextResponse.json({ error: "product_unavailable" }, { status: 400 });
    }
    if (product.stock < qty) {
      return NextResponse.json(
        { error: "out_of_stock", product: product.name, stock: product.stock },
        { status: 409 }
      );
    }
    items.push({ productId: product.id, name: product.name, price: product.price, qty });
    total += product.price * qty;
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  // Save slip image if provided
  let slipName = "";
  if (slipFile && slipFile instanceof File && slipFile.size > 0) {
    if (slipFile.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "slip_too_large" }, { status: 413 });
    }
    const ext = slipFile.name.split(".").pop() || "jpg";
    const buffer = Buffer.from(await slipFile.arrayBuffer());
    slipName = await saveMedia(buffer, ext);
  }

  // Decrement stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    product.stock -= item.qty;
  }
  await saveProducts(products);

  const order: Order = {
    id: uid(),
    code: orderCode(),
    shopId: shop.id,
    shopName: shop.name,
    customerName,
    phone,
    address,
    note,
    items,
    total,
    slip: slipName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);

  return NextResponse.json({ ok: true, code: order.code, total });
}
