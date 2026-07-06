import { cookies } from "next/headers";
import crypto from "crypto";

// ── Lightweight admin auth ──
// A single shared password (env ADMIN_PASSWORD) gates the /admin area.
// On login we set an httpOnly cookie holding a hash of the password so the
// raw password is never stored in the browser.

const COOKIE = "bh_admin";
const SECRET = process.env.ADMIN_SECRET || "bearcards-static-secret";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "bearcards";
}

export function tokenFor(password: string): string {
  return crypto.createHash("sha256").update(password + SECRET).digest("hex");
}

export function expectedToken(): string {
  return tokenFor(adminPassword());
}

/** Server-side check: is the current request authenticated as admin? */
export function isAdmin(): boolean {
  const c = cookies().get(COOKIE)?.value;
  return !!c && c === expectedToken();
}

export const ADMIN_COOKIE = COOKIE;
