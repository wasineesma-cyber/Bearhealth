import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getBills, saveBills } from "@/lib/store";

export const dynamic = "force-dynamic";

// Cancel a bill (only while still open).
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const bills = await getBills();
  const bill = bills.find((b) => b.id === params.id);
  if (!bill) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (body.status === "cancelled" && bill.status === "open") {
    bill.status = "cancelled";
    await saveBills(bills);
  }
  return NextResponse.json({ ok: true, bill });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const bills = await getBills();
  const next = bills.filter((b) => b.id !== params.id);
  if (next.length === bills.length) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await saveBills(next);
  return NextResponse.json({ ok: true });
}
