import type { AiProvider } from "../aiProvider.interface.js";
import type { ScanResult } from "../../../../../../packages/shared/scan";
export declare class GroqProvider implements AiProvider {
    readonly name = "groq";
    private readonly client;
    private readonly model;
    constructor();
    analyze(scrubbedText: string): Promise<ScanResult>;
}
//# sourceMappingURL=groq.provider.d.ts.map