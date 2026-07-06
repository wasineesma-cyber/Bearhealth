import { NextResponse } from "next/server";
import { getShopBySlug, getCategories, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: one shop's storefront data (categories + active products).
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const shop = await getShopBySlug(params.slug);
  if (!shop || !shop.active) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [cats, products] = await Promise.all([getCategories(), getProducts()]);

  return NextResponse.json({
    shop: {
      slug: shop.slug,
      name: shop.name,
      description: shop.description,
      promptpayName: shop.promptpayName,
      shippingNote: shop.shippingNote,
      hasPromptpay: !!shop.promptpayId,
    },
    categories: cats.filter((c) => c.shopId === shop.id),
    products: products.filter((p) => p.shopId === shop.id && p.active),
  });
}
