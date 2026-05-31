/**
 * Shared Zod field helpers used by CMS forms across modules.
 *
 * Per-module schemas import these primitives so the validation rules stay
 * consistent (e.g. slug format, email rules, title length). Adding a new
 * field rule? Put the generic version here; specialize in the module file.
 */
import { z } from "zod";

export const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Slug only: lowercase letters, digits, hyphens.");

export const title = z.string().trim().min(2).max(200);
export const summary = z.string().trim().min(2).max(500);
export const longBody = z.string().trim().min(2).max(50_000);

export const email = z.string().trim().toLowerCase().email().max(254);

export const phoneIndonesian = z
  .string()
  .trim()
  .regex(/^[\d+()\-\s]{8,20}$/, "Use digits, +, parentheses, dash, space.")
  .optional()
  .or(z.literal(""));

export const order = z.number().int().min(0).max(10_000);

export const iconKey = z.string().trim().min(1).max(60);

export const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const cuid = z.string().cuid();
