import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getProducts, saveProducts, getCategories, saveMedia } from "@/lib/store";

export const dynamic = "force-dynamic";

// Update product (multipart/form-data; any field optional, image replaces if sent).
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const products = await getProducts();
  const product = products.find((p) => p.id === params.id);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const has = (k: string) => form.get(k) !== null;

  if (has("name") && String(form.get("name")).trim()) product.name = String(form.get("name")).trim();
  if (has("description")) product.description = String(form.get("description")).trim();
  if (has("price")) product.price = Math.max(0, Number(form.get("price")) || 0);
  if (has("stock")) product.stock = Math.max(0, Math.floor(Number(form.get("stock")) || 0));
  if (has("active")) product.active = String(form.get("active")) !== "false";

  if (has("categoryId")) {
    const categoryId = String(form.get("categoryId"));
    const cats = await getCategories();
    if (cats.some((c) => c.id === categoryId && c.shopId === product.shopId)) {
      product.categoryId = categoryId;
    }
  }

  const file = form.get("image");
  if (file && file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop() || "jpg";
    product.image = await saveMedia(Buffer.from(await file.arrayBuffer()), ext);
  }

  await saveProducts(products);
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const products = await getProducts();
  const next = products.filter((p) => p.id !== params.id);
  if (next.length === products.length) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await saveProducts(next);
  return NextResponse.json({ ok: true });
}
