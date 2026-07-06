import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getCategories, saveCategories, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const cats = await getCategories();
  const cat = cats.find((c) => c.id === params.id);
  if (!cat) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (typeof body.name === "string" && body.name.trim()) cat.name = body.name.trim();
  if (typeof body.order === "number") cat.order = body.order;

  await saveCategories(cats);
  return NextResponse.json({ ok: true, category: cat });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const products = await getProducts();
  if (products.some((p) => p.categoryId === params.id)) {
    return NextResponse.json({ error: "category_not_empty" }, { status: 409 });
  }

  const cats = await getCategories();
  const next = cats.filter((c) => c.id !== params.id);
  if (next.length === cats.length) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await saveCategories(next);
  return NextResponse.json({ ok: true });
}
