/**
 * POST /api/v1/admin/media/sign
 *
 * Issues a short-lived Cloudinary signature for a browser direct-upload to
 * `api.cloudinary.com`. Body:
 *   { folder: "gallery" | "fleet" | "news" | "about" | "brand" }
 *
 * Returns:
 *   { cloudName, apiKey, timestamp, folder, signature }
 *
 * RBAC is enforced inside `MediaService.getSignedUploadPayload`
 * (`requirePermission("media:create")`). The proxy.ts middleware already
 * authenticates the session and applies admin security headers.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MediaService,
  MediaNotConfiguredError,
} from "@/server/services/media.service";
import { mediaFolderSchema } from "@/lib/validation/media";
import {
  UnauthorizedError,
  ForbiddenError,
  SessionStaleError,
} from "@/server/auth/guards";

const bodySchema = z.object({ folder: mediaFolderSchema });

export async function POST(req: Request) {
  let parsed;
  try {
    const json = await req.json();
    parsed = bodySchema.safeParse(json);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const payload = await MediaService.getSignedUploadPayload(parsed.data.folder);
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof SessionStaleError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (e instanceof MediaNotConfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
