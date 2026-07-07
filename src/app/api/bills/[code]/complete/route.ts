import { NextResponse } from "next/server";
import {
  getBillByCode, getBills, saveBills,
  getProducts, saveProducts,
  getOrders, saveOrders,
  saveMedia, uid, orderCode,
} from "@/lib/store";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

// Public: customer completes a bill by filling in address + slip.
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const bill = await getBillByCode(params.code);
  if (!bill) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (bill.status !== "open") {
    return NextResponse.json({ error: "bill_" + bill.status }, { status: 409 });
  }

  const customerName = String(form.get("customerName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const address = String(form.get("address") || "").trim();
  const note = String(form.get("note") || "").trim();
  const slipFile = form.get("slip");

  if (!customerName || !phone || !address) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Validate stock at completion time and deduct.
  const products = await getProducts();
  for (const item of bill.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "product_unavailable", product: item.name }, { status: 409 });
    }
    if (product.stock < item.qty) {
      return NextResponse.json(
        { error: "out_of_stock", product: product.name, stock: product.stock },
        { status: 409 }
      );
    }
  }

  let slipName = "";
  if (slipFile && slipFile instanceof File && slipFile.size > 0) {
    if (slipFile.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "slip_too_large" }, { status: 413 });
    }
    const ext = slipFile.name.split(".").pop() || "jpg";
    slipName = await saveMedia(Buffer.from(await slipFile.arrayBuffer()), ext);
  }

  for (const item of bill.items) {
    const product = products.find((p) => p.id === item.productId)!;
    product.stock -= item.qty;
  }
  await saveProducts(products);

  const order: Order = {
    id: uid(),
    code: orderCode(),
    shopId: bill.shopId,
    shopName: bill.shopName,
    customerName,
    phone,
    address,
    note: note ? `${note} (จากบิล ${bill.code})` : `จากบิล ${bill.code}`,
    items: bill.items,
    total: bill.total,
    slip: slipName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);

  // mark the bill completed
  const bills = await getBills();
  const b = bills.find((x) => x.id === bill.id);
  if (b) {
    b.status = "completed";
    b.orderCode = order.code;
    await saveBills(bills);
  }

  return NextResponse.json({ ok: true, code: order.code });
}
