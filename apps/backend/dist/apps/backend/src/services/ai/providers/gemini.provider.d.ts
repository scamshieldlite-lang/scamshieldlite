import type { AiProvider } from "../aiProvider.interface.js";
import type { ScanResult } from "../../../../../../packages/shared/scan";
export declare class GeminiProvider implements AiProvider {
    readonly name = "gemini-2.0-flash";
    private readonly client;
    private readonly modelName;
    constructor();
    analyze(scrubbedText: string): Promise<ScanResult>;
}
//# sourceMappingURL=gemini.provider.d.ts.map