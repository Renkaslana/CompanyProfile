/**
 * Typed permission constants — single source of truth for RBAC.
 *
 * Adding a permission:
 *   1. Append the string here.
 *   2. Update `ROLE_PERMISSIONS` for each role that should grant it.
 *   3. Update `DOCS/SECURITY.md` RBAC matrix.
 *   4. Run `npm run db:seed` (idempotent — refreshes `Role.permissions`).
 *
 * This file is intentionally framework-agnostic (no `server-only`, no Prisma
 * imports) so it can be loaded from the Edge runtime (middleware) as well as
 * from server services.
 */

export const PERMISSIONS = [
  "dashboard:read",
  "content:read",
  "content:write",
  "content:publish",
  "fleet:write",
  "media:create",
  "faq:write",
  "faq:publish",
  "support:manage",
  "lead:read",
  "lead:update",
  "settings:write",
  "users:manage",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  EDITOR: "EDITOR",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  VIEWER: "VIEWER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** Canonical role → permissions mapping. Mirrors DOCS/SECURITY.md matrix. */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  EDITOR: [
    "dashboard:read",
    "content:read",
    "content:write",
    "content:publish",
    "fleet:write",
    "media:create",
    "lead:read",
    "lead:update",
  ],
  SUPPORT_AGENT: [
    "dashboard:read",
    "content:read",
    "media:create",
    "faq:write",
    "faq:publish",
    "support:manage",
    "lead:read",
    "lead:update",
  ],
  VIEWER: ["dashboard:read", "content:read"],
};
