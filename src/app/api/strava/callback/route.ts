import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/activity?strava=error", req.url));
  }

  try {
    const token = await exchangeStravaCode(code);
    const cookieStore = await cookies();

    // Store tokens in httpOnly cookies (personal app — 1 year expiry)
    cookieStore.set("strava_access_token", token.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    cookieStore.set("strava_refresh_token", token.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    cookieStore.set("strava_expires_at", String(token.expires_at), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return NextResponse.redirect(new URL("/activity?strava=connected", req.url));
  } catch {
    return NextResponse.redirect(new URL("/activity?strava=error", req.url));
  }
}
