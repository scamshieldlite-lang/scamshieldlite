// apps/backend/src/services/pii/piiScrubber.service.ts
import { scrubPii } from "./pii/piiScrubber.service.js";
import { aiService } from "./ai/ai.service.js";
import { db } from "../db/index.js";
import { scans } from "../db/schema.js";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";
import { InvalidInputError } from "../utils/errors.js";
export const detectionService = {
    async run(params) {
        const { rawText, userId, deviceFingerprint, inputType = "text" } = params;
        // ── 1. Validate input ────────────────────────────────────────
        this.validateInput(rawText);
        // ── 2. Scrub PII — never pass raw text to AI or DB ──────────
        const { scrubbed, originalLength, redactedCount } = scrubPii(rawText);
        logger.info({
            originalLength,
            scrubbedLength: scrubbed.length,
            redactedCount,
            userId,
        }, "PII scrubbing complete");
        // ── 3. Run AI detection on scrubbed text ─────────────────────
        const { provider, ...scanResult } = await aiService.analyze(scrubbed);
        logger.info({
            provider,
            riskLevel: scanResult.risk_level,
            riskScore: scanResult.risk_score,
            userId,
        }, "Scan completed");
        // ── 4. Persist — registered users only ───────────────────────
        let scanId;
        if (userId) {
            try {
                const [inserted] = await db
                    .insert(scans)
                    .values({
                    userId,
                    deviceFingerprint: deviceFingerprint ?? null,
                    inputType,
                    inputLength: originalLength,
                    scrubbedInput: scrubbed,
                    riskScore: scanResult.risk_score,
                    riskLevel: scanResult.risk_level,
                    scamType: scanResult.scam_type ?? "",
                    indicatorsDetected: scanResult.indicators_detected,
                    explanation: scanResult.explanation,
                    recommendation: scanResult.recommendation,
                    aiProvider: provider,
                })
                    .returning({ id: scans.id });
                scanId = inserted?.id;
            }
            catch (dbError) {
                // Non-fatal — scan result still returned even if save fails
                logger.error({ dbError, userId }, "Failed to persist scan result");
            }
        }
        return { scanResult, scanId, provider };
    },
    validateInput(text) {
        if (!text || typeof text !== "string") {
            throw new InvalidInputError("Message text is required");
        }
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            throw new InvalidInputError("Message text cannot be empty");
        }
        if (trimmed.length < 10) {
            throw new InvalidInputError("Message is too short to analyze (minimum 10 characters)");
        }
        if (trimmed.length > env.AI_MAX_INPUT_LENGTH) {
            throw new InvalidInputError(`Message is too long (maximum ${env.AI_MAX_INPUT_LENGTH} characters)`);
        }
    },
};
//# sourceMappingURL=detection.service.js.map