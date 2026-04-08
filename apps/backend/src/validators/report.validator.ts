import { z } from "zod";

export const reportRequestSchema = z.object({
  scannedText: z
    .string()
    .min(10, "Message too short to report")
    .max(5000, "Message too long"),

  scamType: z.string().max(100).optional(),

  userConfirmedScamType: z.string().max(100).optional(),

  comment: z
    .string()
    .max(300, "Comment must be under 300 characters")
    .optional(),

  riskScore: z.number().int().min(0).max(100).optional(),

  indicatorsDetected: z.array(z.string().max(80)).max(10).optional(),
});

export type ValidatedReportRequest = z.infer<typeof reportRequestSchema>;
