/**
 * Prisma client — singleton.
 *
 * Pattern: stash the client on `globalThis` in non-production so Next's hot
 * reload (Turbopack) doesn't instantiate a fresh `PrismaClient` per request,
 * which would otherwise exhaust Neon's pooled connections.
 *
 * Connection URLs are read from the environment by Prisma directly (see
 * `prisma/schema.prisma` datasource block). `lib/config/env` is imported here
 * for its boot-time Zod validation side-effect — every code path that touches
 * the DB first runs through validated env (ADR 0007 / DOCS/SECURITY.md).
 *
 * Server-only. Never import from a client component.
 */
import "server-only";
import { PrismaClient } from "@prisma/client";
// Side-effect import: triggers Zod validation of DATABASE_URL / DIRECT_DATABASE_URL.
import "@/lib/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
