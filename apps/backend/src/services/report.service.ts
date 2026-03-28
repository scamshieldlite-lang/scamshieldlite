import { db } from "@/db";
import { reportedScams } from "@/db/schema";
import { and, eq, gte, or } from "drizzle-orm";
import { scrubPii } from "./pii/piiScrubber.service";
import { hashIp } from "@/utils/hash";
import { logger } from "@/utils/logger";
import type { ValidatedReportRequest } from "@/validators/report.validator";

export interface SubmitReportParams {
  data: ValidatedReportRequest;
  userId?: string;
  deviceFingerprint?: string;
  ip?: string;
}

export interface SubmitReportResult {
  reportId: string;
  isDuplicate: boolean;
}

// Duplicate suppression window — 1 hour
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

export const reportService = {
  /**
   * Submit a scam report.
   *
   * Pipeline:
   * 1. Scrub PII from scannedText and optional comment
   * 2. Check for duplicate from same identity within 1h
   * 3. Insert into reported_scams (PII-free)
   */
  async submit(params: SubmitReportParams): Promise<SubmitReportResult> {
    const { data, userId, deviceFingerprint, ip } = params;

    // ── 1. Scrub PII ────────────────────────────────────────────
    const { scrubbed: scrubbedInput } = scrubPii(data.scannedText);
    const scrubbedComment = data.comment
      ? scrubPii(data.comment).scrubbed
      : undefined;

    logger.info(
      {
        userId,
        originalLength: data.scannedText.length,
        scrubbedLength: scrubbedInput.length,
      },
      "Report PII scrubbed",
    );

    // ── 2. Duplicate check ──────────────────────────────────────
    const isDuplicate = await this.isDuplicate({
      userId,
      deviceFingerprint,
      scrubbedInput,
    });

    if (isDuplicate) {
      logger.info({ userId, deviceFingerprint }, "Duplicate report suppressed");
      // Return a fake success — no need to tell the user
      return {
        reportId: "duplicate",
        isDuplicate: true,
      };
    }

    // ── 3. Insert ───────────────────────────────────────────────
    const scamType = data.userConfirmedScamType ?? data.scamType ?? "unknown";

    const [inserted] = await db
      .insert(reportedScams)
      .values({
        userId: userId ?? null,
        deviceFingerprint: deviceFingerprint ?? null,
        scrubbedInput,
        riskScore: data.riskScore ?? 0,
        scamType,
        indicatorsDetected: data.indicatorsDetected ?? [],
        createdAt: new Date(),
      })
      .returning({ id: reportedScams.id });

    logger.info(
      {
        reportId: inserted.id,
        userId,
        scamType,
      },
      "Scam report submitted",
    );

    return {
      reportId: inserted.id,
      isDuplicate: false,
    };
  },

  /**
   * Check if this identity already reported this
   * scrubbed message within the duplicate window.
   */
  async isDuplicate({
    userId,
    deviceFingerprint,
    scrubbedInput,
  }: {
    userId?: string;
    deviceFingerprint?: string;
    scrubbedInput: string;
  }): Promise<boolean> {
    if (!userId && !deviceFingerprint) return false;

    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);

    // Build identity condition
    const identityCondition = userId
      ? eq(reportedScams.userId, userId)
      : eq(reportedScams.deviceFingerprint, deviceFingerprint!);

    const existing = await db.query.reportedScams.findFirst({
      where: and(
        identityCondition,
        eq(reportedScams.scrubbedInput, scrubbedInput),
        gte(reportedScams.createdAt, windowStart),
      ),
    });

    return !!existing;
  },
};
