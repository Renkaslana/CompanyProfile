/**
 * Auth.js v5 — Node-runtime configuration.
 *
 * Wraps `auth.config.ts` (Edge-safe shared config) with the Credentials
 * provider. The `authorize` callback runs in Node so it can use Prisma,
 * argon2, and the audit log writer.
 *
 * Exports `auth`, `signIn`, `signOut`, `handlers` — used by:
 *   • Route handler at `app/api/auth/[...nextauth]/route.ts`
 *   • `server/auth/guards.ts` for service-layer session access
 *   • `middleware.ts` reads from `auth.config.ts` directly (Edge)
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import authConfig from "./auth.config";
import { authenticateUser } from "@/server/services/auth.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0].trim() ??
          request?.headers?.get("x-real-ip") ??
          "unknown";
        return authenticateUser(parsed.data.email, parsed.data.password, ip);
      },
    }),
  ],
});
