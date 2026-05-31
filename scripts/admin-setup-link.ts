/**
 * Bootstrap CLI — generate a one-time password-setup link for an admin.
 *
 * Usage:
 *   npm run admin:setup-link -- --email=admin@bintangmuliainvestama.co.id
 *
 * Prints a URL valid for 1 hour, single-use. The URL is NOT stored (only the
 * sha256 of the token lives in `AuthToken`).
 *
 * Run requires AUTH_URL + DATABASE_URL set in `.env`.
 */
import { db } from "../lib/db";
import { createPasswordSetupToken } from "../server/services/auth.service";
import { env } from "../lib/config/env";

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith("--email="))?.split("=")[1];
  if (!emailArg) {
    console.error(
      "usage: npm run admin:setup-link -- --email=admin@bintangmuliainvestama.co.id",
    );
    process.exit(1);
  }
  const email = emailArg.toLowerCase().trim();

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email: ${email}`);
    console.error(
      "Hint: seed the admin first with `npm run db:seed` (default email is admin@bintangmuliainvestama.co.id).",
    );
    process.exit(1);
  }

  const raw = await createPasswordSetupToken(user.id);
  const url = `${env.AUTH_URL.replace(/\/$/, "")}/admin/setup-password?token=${raw}`;

  console.log("");
  console.log("┌──────────────────────────────────────────────────────────────┐");
  console.log("│  One-time password setup link (single-use, expires in 1h)    │");
  console.log("└──────────────────────────────────────────────────────────────┘");
  console.log("");
  console.log(`  user:  ${user.email}`);
  console.log(`  link:  ${url}`);
  console.log("");
  console.log("Do not share or persist this URL.");
}

main()
  .catch((e) => {
    console.error("admin-setup-link failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
