import type { Request, Response, NextFunction } from "express";
export declare const scanController: {
    /**
     * POST /api/scan
     * Runs the full detection pipeline.
     * Rate limiting is enforced by rateLimitMiddleware (applied in the route).
     */
    analyze(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/scan/history
     * Returns the last 20 scans for the authenticated user.
     */
    getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/scan/usage
     * Returns current scan usage without consuming a scan.
     */
    getUsage(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=scan.controller.d.ts.map