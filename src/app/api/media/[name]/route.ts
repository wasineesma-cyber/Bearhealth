import { NextResponse } from "next/server";
import { readMedia, contentTypeFor } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const buf = await readMedia(params.name);
  if (!buf) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": contentTypeFor(params.name),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
