// apps/backend/src/jobs/retention.job.ts

import { retentionService } from "@/services/retention.service.js";
import { logger } from "@/utils/logger.js";

const EVERY_24_HOURS = 24 * 60 * 60 * 1000;

let timer: ReturnType<typeof setInterval> | null = null;

export function startRetentionScheduler(): void {
  // Run once at startup (catches any backlog)
  runJob();

  // Then every 24 hours
  timer = setInterval(runJob, EVERY_24_HOURS);

  logger.info("Retention scheduler started — runs every 24h");
}

export function stopRetentionScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info("Retention scheduler stopped");
  }
}

async function runJob(): Promise<void> {
  try {
    await retentionService.runAll();
  } catch (error) {
    // Non-fatal — log and continue
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      "Retention job threw unexpectedly",
    );
  }
}
