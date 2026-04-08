const STRAVA_API = "https://www.strava.com/api/v3";

export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/strava/callback`,
    response_type: "code",
    scope: "activity:read_all,read",
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function exchangeStravaCode(code: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Failed to exchange Strava code");
  return res.json();
}

export async function refreshStravaToken(refreshToken: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh Strava token");
  return res.json();
}

export async function getStravaActivities(accessToken: string, perPage = 10) {
  const res = await fetch(
    `${STRAVA_API}/athlete/activities?per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch Strava activities");
  const data = await res.json();
  return data.map((a: any) => ({
    id: String(a.id),
    name: a.name,
    type: a.sport_type ?? a.type,
    date: a.start_date_local?.split("T")[0] ?? "",
    startTime: a.start_date_local?.split("T")[1]?.slice(0, 5) ?? "",
    duration: Math.round(a.moving_time / 60),
    distance: Math.round((a.distance / 1000) * 100) / 100, // km
    elevation: Math.round(a.total_elevation_gain ?? 0),
    avgHR: a.average_heartrate ?? null,
    maxHR: a.max_heartrate ?? null,
    calories: Math.round(a.calories ?? 0),
    avgSpeed: Math.round(((a.average_speed ?? 0) * 3.6) * 10) / 10, // km/h
    kudos: a.kudos_count ?? 0,
    mapUrl: a.map?.summary_polyline ? `https://maps.googleapis.com/maps/api/staticmap?...` : null,
  }));
}

export async function getStravaAthlete(accessToken: string) {
  const [athleteRes, statsRes] = await Promise.all([
    fetch(`${STRAVA_API}/athlete`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch(`${STRAVA_API}/athlete/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null),
  ]);
  const athlete = await athleteRes.json();
  const stats = statsRes?.ok ? await statsRes.json() : null;
  return {
    name: `${athlete.firstname ?? ""} ${athlete.lastname ?? ""}`.trim(),
    city: athlete.city ?? "",
    country: athlete.country ?? "",
    profile: athlete.profile ?? null,
    ytdRuns: stats?.ytd_run_totals ?? null,
    ytdRides: stats?.ytd_ride_totals ?? null,
    allRunDistance: Math.round((stats?.all_run_totals?.distance ?? 0) / 1000),
  };
}
