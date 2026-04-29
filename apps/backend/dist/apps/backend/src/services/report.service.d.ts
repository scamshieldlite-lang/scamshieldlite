import type { ValidatedReportRequest } from "../validators/report.validator.js";
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
export declare const reportService: {
    /**
     * Submit a scam report.
     *
     * Pipeline:
     * 1. Scrub PII from scannedText and optional comment
     * 2. Check for duplicate from same identity within 1h
     * 3. Insert into reported_scams (PII-free)
     */
    submit(params: SubmitReportParams): Promise<SubmitReportResult>;
    /**
     * Check if this identity already reported this
     * scrubbed message within the duplicate window.
     */
    isDuplicate({ userId, deviceFingerprint, scrubbedInput, }: {
        userId?: string;
        deviceFingerprint?: string;
        scrubbedInput: string;
    }): Promise<boolean>;
};
//# sourceMappingURL=report.service.d.ts.map