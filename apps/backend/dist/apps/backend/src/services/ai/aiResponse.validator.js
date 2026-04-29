// apps/backend/src/services/ai/aiResponse.validator.ts
import { z } from "zod";
const scanResultSchema = z.object({
    risk_score: z.number().int().min(0).max(100),
    risk_level: z.enum(["Likely Safe", "Suspicious", "Likely Scam"]),
    scam_type: z.string().max(100).default(""),
    indicators_detected: z.array(z.string().max(80)).max(8).default([]),
    explanation: z.string().min(10).max(1000),
    recommendation: z.string().min(10).max(500),
});
export function validateAiResponse(raw) {
    const parsed = scanResultSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(`AI response validation failed: ${parsed.error.message}`);
    }
    // Enforce risk_level consistency with risk_score
    // If model returns mismatched score/level, the score wins
    const result = parsed.data;
    result.risk_level = scoreToLevel(result.risk_score);
    return result;
}
function scoreToLevel(score) {
    if (score <= 20)
        return "Likely Safe";
    if (score <= 50)
        return "Suspicious";
    return "Likely Scam";
}
//# sourceMappingURL=aiResponse.validator.js.map