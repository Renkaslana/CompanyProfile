-- Phase 4 M9 — TeamMember.bio (optional short public bio).
-- Additive, nullable; backward-compatible with all existing rows.

ALTER TABLE "TeamMember" ADD COLUMN "bio" TEXT;
