/**
 * Edge middleware — applies to /admin/* and /api/v1/admin/*.
 *
 * Two responsibilities:
 *   1. Auth.js `authorized` callback decides whether the request continues
 *      (presence of a signed JWT). Bypass paths defined in auth.config.ts.
 *   2. The wrapper attaches admin-only security headers and applies coarse
 *      role gates that don't need DB access (the JWT carries `permissions`).
 *
 * Fine-grained permission checks happen in the service layer
 * (`requirePermission`) — defense in depth.
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/** Role-based coarse gates: prefix → required permission. */
const ROUTE_GUARDS: Array<{ prefix: string; perm: string }> = [
  { prefix: "/admin/users", perm: "users:manage" },
  { prefix: "/admin/audit", perm: "audit:read" },
  { prefix: "/admin/media", perm: "media:create" },
  { prefix: "/admin/services", perm: "content:read" },
  { prefix: "/admin/news", perm: "content:read" },
  { prefix: "/admin/gallery", perm: "content:read" },
  { prefix: "/admin/team", perm: "content:read" },
  { prefix: "/admin/clients", perm: "content:read" },
  { prefix: "/admin/stats", perm: "content:read" },
  { prefix: "/admin/settings", perm: "content:read" },
  { prefix: "/admin/settings", perm: "settings:write" },
];

export default auth((req) => {
  const url = req.nextUrl;
  const path = url.pathname;

  // For authenticated admin pages, perform a coarse role gate using JWT claims.
  if (req.auth?.user) {
    for (const guard of ROUTE_GUARDS) {
      if (path.startsWith(guard.prefix)) {
        const perms = req.auth.user.permissions ?? [];
        if (!perms.includes(guard.perm)) {
          return NextResponse.redirect(new URL("/admin?error=forbidden", url));
        }
        break;
      }
    }
  }

  const res = NextResponse.next();
  if (path.startsWith("/admin") || path.startsWith("/api/v1/admin")) {
    for (const [k, v] of Object.entries(ADMIN_HEADERS)) {
      res.headers.set(k, v);
    }
  }
  return res;
});

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
