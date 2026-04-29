// apps/backend/src/controllers/scan.controller.ts

import type { Request, Response, NextFunction } from "express";
import { detectionService } from "@/services/detection.service.js";
import { rateLimitService } from "@/services/rateLimit.service.js";
import { db } from "@/db/index.js";
import { scans } from "@/db/schema.js";
import { desc, eq } from "drizzle-orm";
import { hashIp } from "@/utils/hash.js";
import { requireAuth } from "@/middleware/requireAuth.js";
import { InvalidInputError } from "@/utils/errors.js";
import type {
  ScanRequest,
  ScanResponse,
  UsageSummary,
} from "@scamshieldlite/shared";
import { subscriptionService } from "@/services/subscription.service.js";
import { logger } from "@/utils/logger.js";
import { env } from "@/utils/env.js";

export const scanController = {
  /**
   * POST /api/scan
   * Runs the full detection pipeline.
   * Rate limiting is enforced by rateLimitMiddleware (applied in the route).
   */
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as ScanRequest;

      if (!body?.text) {
        throw new InvalidInputError("text field is required");
      }

      const result = await detectionService.run({
        rawText: body.text,
        userId: req.user?.id,
        deviceFingerprint:
          body.deviceFingerprint ??
          (req.headers["x-device-fingerprint"] as string),
        inputType: "text",
      });

      const rateLimitResult = req.rateLimitResult;

      const response: ScanResponse = {
        result: result.scanResult,
        ...(result.scanId && { scanId: result.scanId }),
        ...(rateLimitResult && {
          scansRemaining: rateLimitResult.remaining,
        }),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/scan/history
   * Returns the last 20 scans for the authenticated user.
   */
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      // Inline auth check — will be middleware in Phase 7
      if (!req.user) {
        res
          .status(401)
          .json({ error: "Authentication required", code: "UNAUTHORIZED" });
        return;
      }

      const history = await db.query.scans.findMany({
        where: eq(scans.userId, req.user.id),
        orderBy: [desc(scans.createdAt)],
        limit: 20,
        columns: {
          id: true,
          riskScore: true,
          riskLevel: true,
          scamType: true,
          indicatorsDetected: true,
          explanation: true,
          recommendation: true,
          createdAt: true,
          // Deliberately excluded: scrubbedInput — don't send stored text back
        },
      });

      res.json({ history });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/scan/usage
   * Returns current scan usage without consuming a scan.
   */
  async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.socket.remoteAddress;

      // Remove the subscription creation from here — moved to sign-in
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
