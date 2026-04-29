import { z } from "zod";
export declare const reportRequestSchema: z.ZodObject<{
    scannedText: z.ZodString;
    scamType: z.ZodOptional<z.ZodString>;
    userConfirmedScamType: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
    riskScore: z.ZodOptional<z.ZodNumber>;
    indicatorsDetected: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ValidatedReportRequest = z.infer<typeof reportRequestSchema>;
//# sourceMappingURL=report.validator.d.ts.map