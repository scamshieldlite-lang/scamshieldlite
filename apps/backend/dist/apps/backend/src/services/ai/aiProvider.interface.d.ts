import type { ScanResult } from "../../../../../packages/shared/scan";
export interface AiProvider {
    readonly name: string;
    analyze(scrubbedText: string): Promise<ScanResult>;
}
//# sourceMappingURL=aiProvider.interface.d.ts.map