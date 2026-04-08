export { default } from "next-auth/middleware";

export const config = {
  // Protect all pages except login, api/auth, and static files
  matcher: ["/((?!login|api/auth|_next|icons|manifest|sw.js|favicon).*)"],
};
