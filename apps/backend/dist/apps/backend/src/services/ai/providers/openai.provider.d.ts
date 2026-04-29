import type { AiProvider } from "../aiProvider.interface.js";
import type { ScanResult } from "../../../../../../packages/shared/scan";
export declare class OpenAIProvider implements AiProvider {
    readonly name: string;
    private readonly client;
    private readonly model;
    constructor();
    analyze(scrubbedText: string): Promise<ScanResult>;
}
//# sourceMappingURL=openai.provider.d.ts.map