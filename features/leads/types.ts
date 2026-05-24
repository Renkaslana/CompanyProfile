import { z } from "zod";
import type { ServiceCategory } from "@/features/content/types";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  service?: ServiceCategory;
  message: string;
  status: LeadStatus;
  source?: string;
  createdAt: string;
}

/** Validation for the public quote/contact form (PRD §11). */
export const leadFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  company: z.string().optional(),
  email: z.string().email("Format email tidak valid."),
  phone: z
    .string()
    .min(8, "Nomor telepon tidak valid.")
    .optional()
    .or(z.literal("")),
  service: z
    .enum(["LOGISTICS", "TRANSPORTATION", "CAR_RENTAL", "GENERAL_TRADING"])
    .optional(),
  message: z.string().min(10, "Mohon jelaskan kebutuhan Anda (min. 10 karakter)."),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
