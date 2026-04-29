/**
 * PII Scrubber
 *
 * Strips personally identifiable information from text before it is
 * sent to an AI provider or written to the database.
 *
 * Design rules:
 * - Over-scrub rather than under-scrub (false positives are acceptable)
 * - Replace with labelled placeholders so AI context is preserved
 * - Never log the raw input — only log the scrubbed version
 */
export interface ScrubResult {
    scrubbed: string;
    originalLength: number;
    redactedCount: number;
}
export declare function scrubPii(rawText: string): ScrubResult;
//# sourceMappingURL=piiScrubber.service.d.ts.map