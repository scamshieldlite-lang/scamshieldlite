// apps/backend/src/middleware/rateLimit.ts
import { rateLimitService } from "../services/rateLimit.service.js";
import { RateLimitError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
/**
 * Rate limit middleware for scan endpoints.
 *
 * Must run AFTER optionalAuth so req.user is populated for registered users.
 * Sets rate limit headers on every response for client transparency.
 */
export async function rateLimitMiddleware(req, res, next) {
    try {
        const identity = {
            userId: req.user?.id,
            deviceFingerprint: extractFingerprint(req),
            ip: extractIp(req),
        };
        const result = await rateLimitService.checkAndLog(identity);
        // Set standard rate limit headers so the mobile app can read them
        res.setHeader("X-RateLimit-Limit", result.limit);
        res.setHeader("X-RateLimit-Remaining", result.remaining);
        res.setHeader("X-RateLimit-Reset", result.resetAt.toISOString());
        res.setHeader("X-RateLimit-Tier", result.tier);
        if (!result.allowed) {
            logger.warn({
                requestId: req.id,
                userId: req.user?.id,
                tier: result.tier,
                count: result.count,
                limit: result.limit,
            }, "Rate limit exceeded");
            throw new RateLimitError(`Daily scan limit reached. Upgrade for more scans.`, result.remaining);
        }
        // Attach usage to req so the scan controller can include it in the response
        req.rateLimitResult = result;
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * Extract device fingerprint from request headers.
 * The mobile app sends this as X-Device-Fingerprint on every request.
 */
function extractFingerprint(req) {
    const fp = req.headers["x-device-fingerprint"];
    return typeof fp === "string" && fp.length > 0 ? fp : undefined;
}
/**
 * Extract real client IP, respecting proxy headers when trust proxy is set.
 */
function extractIp(req) {
    return (req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
        req.socket.remoteAddress);
}
//# sourceMappingURL=rateLimit.js.map