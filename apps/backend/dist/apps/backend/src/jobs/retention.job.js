// apps/backend/src/jobs/retention.job.ts
import { retentionService } from "../services/retention.service.js";
import { logger } from "../utils/logger.js";
const EVERY_24_HOURS = 24 * 60 * 60 * 1000;
let timer = null;
export function startRetentionScheduler() {
    // Run once at startup (catches any backlog)
    runJob();
    // Then every 24 hours
    timer = setInterval(runJob, EVERY_24_HOURS);
    logger.info("Retention scheduler started — runs every 24h");
}
export function stopRetentionScheduler() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        logger.info("Retention scheduler stopped");
    }
}
async function runJob() {
    try {
        await retentionService.runAll();
    }
    catch (error) {
        // Non-fatal — log and continue
        logger.error(error instanceof Error ? error : new Error(String(error)), "Retention job threw unexpectedly");
    }
}
//# sourceMappingURL=retention.job.js.map