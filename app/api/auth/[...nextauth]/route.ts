/**
 * Auth.js v5 HTTP handler — exposes `/api/auth/*` endpoints (signin, signout,
 * csrf, session, etc.). Implementation comes from `auth.ts`.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
