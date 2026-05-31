/**
 * Auth.js v5 — Edge-safe configuration.
 *
 * This file is loaded by both `auth.ts` (Node runtime, with the Credentials
 * provider) AND `middleware.ts` (Edge runtime). It therefore must NOT import
 * Prisma, argon2, or any Node-only module.
 *
 * Session strategy: JWT (Credentials provider requires it).
 * Sliding TTL: 24h. Absolute lifetime cap: 7 days.
 * JWT claims: sub, email, name, role, permissions, sessionVersion,
 *   mustChangePassword, mfaEnabled, absExp.
 */
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      permissions: string[];
      sessionVersion: number;
      mustChangePassword: boolean;
      mfaEnabled: boolean;
    };
  }
  interface User {
    role?: string;
    permissions?: string[];
    sessionVersion?: number;
    mustChangePassword?: boolean;
    mfaEnabled?: boolean;
  }
}

/** Custom JWT shape — we augment via local interface used inside callbacks. */
type AppJWT = {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  sessionVersion?: number;
  mustChangePassword?: boolean;
  mfaEnabled?: boolean;
  iat?: number;
  exp?: number;
  absExp?: number;
};

const ABS_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const BYPASS_PATHS = [
  "/admin/login",
  "/admin/setup-password",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export default {
  providers: [], // Credentials provider added in auth.ts (Node runtime)
  trustHost: true,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    /**
     * Coarse access check used by middleware. Returns:
     *  - true: allow through
     *  - false: redirect to signIn
     * Fine-grained permission checks happen in the service layer.
     */
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      const isBypass = BYPASS_PATHS.some(
        (p) => path === p || path.startsWith(p + "/"),
      );
      if (isBypass) return true;
      const isAdmin =
        path.startsWith("/admin") || path.startsWith("/api/v1/admin");
      if (!isAdmin) return true;
      return Boolean(session?.user);
    },

    /** Build/refresh the JWT. First call after signIn receives `user`. */
    async jwt({ token, user }) {
      const t = token as AppJWT;
      if (!t.absExp) t.absExp = Date.now() + ABS_LIFETIME_MS;
      if (Date.now() > (t.absExp ?? 0)) {
        // Expired absolute lifetime — clear identifying claims so `authorized()`
        // sees no user and redirects to /admin/login.
        return { absExp: t.absExp } as typeof token;
      }
      if (user) {
        t.sub = (user.id as string | undefined) ?? t.sub;
        t.email = user.email ?? t.email;
        t.name = user.name ?? t.name;
        t.role = user.role;
        t.permissions = user.permissions;
        t.sessionVersion = user.sessionVersion;
        t.mustChangePassword = user.mustChangePassword;
        t.mfaEnabled = user.mfaEnabled;
      }
      return t as typeof token;
    },

    /** Shape session.user from JWT claims. */
    async session({ session, token }) {
      const t = token as AppJWT;
      if (t.sub) {
        // Note: `emailVerified` is required by Auth.js v5's AdapterUser-derived
        // Session shape even though Credentials provider doesn't verify emails.
        // Always pass `null` — UI does not depend on this field.
        session.user = {
          id: t.sub,
          email: t.email ?? "",
          name: t.name ?? "",
          role: t.role ?? "VIEWER",
          permissions: t.permissions ?? [],
          sessionVersion: t.sessionVersion ?? 0,
          mustChangePassword: t.mustChangePassword ?? false,
          mfaEnabled: t.mfaEnabled ?? false,
          emailVerified: null,
        } as typeof session.user;
      }
      return session;
    },

    /**
     * Lock callbackUrl to /admin/* to prevent open-redirect after login.
     */
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.origin !== baseUrl) return baseUrl + "/admin";
        if (!u.pathname.startsWith("/admin")) return baseUrl + "/admin";
        return u.toString();
      } catch {
        return baseUrl + "/admin";
      }
    },
  },
} satisfies NextAuthConfig;
