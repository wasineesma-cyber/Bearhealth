import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getShopBySlug } from "@/lib/store";
import { promptPayPayload } from "@/lib/promptpay";

export const dynamic = "force-dynamic";

// Generate a PromptPay QR (data URL) for a shop + amount.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("shop") || "";
  const amount = Number(searchParams.get("amount") || 0);

  const shop = await getShopBySlug(slug);
  if (!shop || !shop.promptpayId) {
    return NextResponse.json({ error: "no_promptpay" }, { status: 400 });
  }

  const payload = promptPayPayload(shop.promptpayId, amount > 0 ? amount : undefined);
  const qr = await QRCode.toDataURL(payload, { margin: 1, width: 320 });

  return NextResponse.json({
    qr,
    payload,
    promptpayName: shop.promptpayName,
    amount: amount > 0 ? amount : null,
  });
}
