// apps/backend/src/services/pii/piiScrubber.service.ts

import type { ScanResult } from "@scamshieldlite/shared";

export interface AiProvider {
  readonly name: string;
  analyze(scrubbedText: string): Promise<ScanResult>;
}
