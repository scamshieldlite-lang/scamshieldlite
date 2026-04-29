import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            rateLimitResult?: {
                allowed: boolean;
                limit: number;
                count: number;
                remaining: number;
                tier: string;
                resetAt: Date;
            };
        }
    }
}
/**
 * Rate limit middleware for scan endpoints.
 *
 * Must run AFTER optionalAuth so req.user is populated for registered users.
 * Sets rate limit headers on every response for client transparency.
 */
export declare function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map