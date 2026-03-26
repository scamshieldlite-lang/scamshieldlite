import type { Request, Response, NextFunction } from "express";
import { rateLimitService } from "@/services/rateLimit.service";
import { hashIp } from "@/utils/hash";
import type { UsageSummary } from "@scamshieldlite/shared";

export const scanController = {
  async analyze(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 5
    res.status(501).json({ error: "Not yet implemented" });
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 7
    res.status(501).json({ error: "Not yet implemented" });
  },

  async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.socket.remoteAddress;

      const result = await rateLimitService.getUsage({
        userId: req.user?.id,
        deviceFingerprint: req.headers["x-device-fingerprint"] as string,
        ip,
      });

      const body: UsageSummary = {
        scansToday: result.count,
        scanLimit: result.limit,
        scansRemaining: result.remaining,
        isGuest: !req.user,
      };

      res.json(body);
    } catch (error) {
      next(error);
    }
  },
};
