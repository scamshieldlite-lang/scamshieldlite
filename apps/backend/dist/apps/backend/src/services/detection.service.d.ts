import type { ScanResult } from "../../../../packages/shared/scan";
export interface RunDetectionParams {
    rawText: string;
    userId?: string;
    deviceFingerprint?: string;
    inputType?: "text" | "screenshot";
}
export interface DetectionResult {
    scanResult: ScanResult;
    scanId?: string;
    provider: string;
}
export declare const detectionService: {
    run(params: RunDetectionParams): Promise<DetectionResult>;
    validateInput(text: string): void;
};
//# sourceMappingURL=detection.service.d.ts.map