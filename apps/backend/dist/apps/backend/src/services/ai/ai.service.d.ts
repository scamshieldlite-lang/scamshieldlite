import type { ScanResult } from "../../../../../packages/shared/scan";
declare class AiService {
    private providers;
    constructor();
    analyze(scrubbedText: string): Promise<ScanResult & {
        provider: string;
    }>;
}
export declare const aiService: AiService;
export {};
//# sourceMappingURL=ai.service.d.ts.map