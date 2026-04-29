import type { Request, Response, NextFunction } from "express";
import { RateLimitResult } from "../services/rateLimit.service.js";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string | null;
            };
            sessionId?: string;
            id?: string;
            rateLimitResult?: RateLimitResult;
        }
    }
}
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireAuth.d.ts.map