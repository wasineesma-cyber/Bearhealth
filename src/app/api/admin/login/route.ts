import { NextResponse } from "next/server";
import { adminPassword, tokenFor, ADMIN_COOKIE } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");

  if (password !== adminPassword()) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, tokenFor(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
