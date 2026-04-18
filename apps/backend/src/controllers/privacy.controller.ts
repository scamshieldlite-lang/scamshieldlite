import type { Request, Response, NextFunction } from "express";
import {
  consentService,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/services/consent.service";
import { userDataService } from "@/services/userData.service";
import { UnauthorizedError, InvalidInputError } from "@/utils/errors";
import { z } from "zod";
import { logger } from "@/utils/logger";

const updateSettingsSchema = z.object({
  analyticsEnabled: z.boolean().optional(),
  scanHistoryEnabled: z.boolean().optional(),
  crashReportingEnabled: z.boolean().optional(),
});

export const privacyController = {
  /**
   * GET /api/privacy/settings
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const settings = await consentService.getPrivacySettings(req.user.id);
      const consent = await consentService.getLatestConsent(req.user.id);

      res.json({
        settings,
        consent: consent
          ? {
              termsVersion: consent.termsVersion,
              privacyVersion: consent.privacyVersion,
              acceptedAt: consent.createdAt.toISOString(),
            }
          : null,
        currentVersions: {
          terms: CURRENT_TERMS_VERSION,
          privacy: CURRENT_PRIVACY_VERSION,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/privacy/settings
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidInputError("Invalid settings payload");
      }

      await consentService.updatePrivacySettings(req.user.id, parsed.data);

      const updated = await consentService.getPrivacySettings(req.user.id);

      res.json({ settings: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/privacy/consent
   * Called when user accepts updated terms.
   */
  async recordConsent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.socket.remoteAddress;

      await consentService.recordConsent(
        req.user.id,
        ip,
        req.headers["user-agent"],
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/privacy/export
   * Returns a JSON file of all user data.
   */
  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const data = await userDataService.exportUserData(req.user.id);

      // Set headers to trigger file download
      // res
      //   .status(200)
      //   .attachment(`scamshieldlite-data-${req.user.id.slice(0, 8)}.json`)
      //   .json(data);

      logger.info({ userId: req.user.id }, "User data export requested");

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/privacy/scan-history
   * Clears scan history but keeps the account.
   */
  async deleteScanHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const count = await userDataService.deleteScanHistory(req.user.id);

      res.json({
        success: true,
        deletedCount: count,
        message: `${count} scan${count !== 1 ? "s" : ""} deleted`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/privacy/account
   * Full account deletion — irreversible.
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      await userDataService.deleteUserData(req.user.id);

      // Clear the session cookie
      res.clearCookie("better-auth.session_token");

      logger.info({ userId: req.user.id }, "Account deleted");

      res.json({
        success: true,
        message:
          "Your account and all associated data have been permanently deleted.",
      });
    } catch (error) {
      next(error);
    }
  },
};
