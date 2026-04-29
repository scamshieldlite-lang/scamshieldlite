import type { Request, Response, NextFunction } from "express";
import { reportService } from "@/services/report.service.js";
import { reportRequestSchema } from "@/validators/report.validator.js";
import { InvalidInputError } from "@/utils/errors.js";
import { auditLogService } from "@/services/auditLog.service.js";
import { hashIp } from "@/utils/hash.js";
import { logger } from "@/utils/logger.js";
import type { ReportResponse } from "@scamshieldlite/shared/";

export const reportController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      // ── Validate ──────────────────────────────────────────────
      const parsed = reportRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidInputError(
          parsed.error.issues[0]?.message ?? "Invalid report data",
        );
      }

      // ── Extract identity ──────────────────────────────────────
      const deviceFingerprint = req.headers["x-device-fingerprint"] as
        | string
        | undefined;

      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.socket.remoteAddress;

      // Require at least one identity signal
      if (!req.user?.id && !deviceFingerprint) {
        throw new InvalidInputError(
          "Device fingerprint is required for guest reports",
        );
      }

      // ── Submit ────────────────────────────────────────────────
      const { reportId, isDuplicate } = await reportService.submit({
        data: parsed.data,
        userId: req.user?.id,
        deviceFingerprint,
        ip,
      });

      // ── Audit log ─────────────────────────────────────────────
      if (!isDuplicate) {
        await auditLogService.log({
          action: "report",
          userId: req.user?.id,
          deviceFingerprint,
          ipHash: ip ? hashIp(ip) : undefined,
          metadata: {
            scamType: parsed.data.userConfirmedScamType ?? parsed.data.scamType,
            riskScore: parsed.data.riskScore,
          },
        });
      }

      const response: ReportResponse = {
        success: true,
        reportId,
        message: isDuplicate
          ? "Thank you — we already have this report on file."
          : "Thank you for reporting. This helps protect others.",
      };

      logger.info(
        { requestId: req.id, reportId, isDuplicate },
        "Report submitted",
      );

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
};
