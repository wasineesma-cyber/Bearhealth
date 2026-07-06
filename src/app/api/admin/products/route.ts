import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getProducts, saveProducts, getShopById, getCategories, saveMedia, uid } from "@/lib/store";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

// Create product (multipart/form-data with optional image file).
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const shopId = String(form.get("shopId") || "");
  const categoryId = String(form.get("categoryId") || "");
  const name = String(form.get("name") || "").trim();
  const price = Number(form.get("price") || 0);
  const stock = Math.floor(Number(form.get("stock") || 0));

  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!(await getShopById(shopId))) {
    return NextResponse.json({ error: "shop_not_found" }, { status: 400 });
  }
  const cats = await getCategories();
  if (!cats.some((c) => c.id === categoryId && c.shopId === shopId)) {
    return NextResponse.json({ error: "category_invalid" }, { status: 400 });
  }

  let image = "";
  const file = form.get("image");
  if (file && file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop() || "jpg";
    image = await saveMedia(Buffer.from(await file.arrayBuffer()), ext);
  }

  const product: Product = {
    id: uid(),
    shopId,
    categoryId,
    name,
    description: String(form.get("description") || "").trim(),
    price: price > 0 ? price : 0,
    stock: stock >= 0 ? stock : 0,
    image,
    active: String(form.get("active") || "true") !== "false",
    createdAt: new Date().toISOString(),
  };

  const products = await getProducts();
  products.push(product);
  await saveProducts(products);
  return NextResponse.json({ ok: true, product });
}
