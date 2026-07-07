import { NextResponse } from "next/server";
import { getBillByCode, getShopById } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: fetch a bill for the customer link.
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const bill = await getBillByCode(params.code);
  if (!bill) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const shop = await getShopById(bill.shopId);

  return NextResponse.json({
    code: bill.code,
    shopName: bill.shopName,
    shopSlug: shop?.slug || "",
    hasPromptpay: !!shop?.promptpayId,
    promptpayName: shop?.promptpayName || "",
    shippingNote: shop?.shippingNote || "",
    items: bill.items,
    total: bill.total,
    status: bill.status,
    orderCode: bill.orderCode,
  });
}
