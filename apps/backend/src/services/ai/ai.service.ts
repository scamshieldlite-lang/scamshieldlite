// apps/backend/src/services/ai/ai.service.ts

import type { AiProvider } from "./aiProvider.interface";
import type { ScanResult } from "@scamshieldlite/shared";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { ServerError } from "@/utils/errors";

/**
 * AI Service
 *
 * Provider-agnostic facade. All callers use aiService.analyze() —
 * provider selection and fallback are invisible to them.
 *
 * Primary:  Gemini 2.0 Flash (free tier, fast, structured JSON)
 * Fallback: Groq (free tier, ~200ms, good for scam detection)
 */
class AiService {
  private primary: AiProvider;
  private fallback: AiProvider | null;

  constructor() {
    // Primary: always Gemini when key is present
    this.primary = new GeminiProvider();

    // Fallback: Groq if key is configured
    this.fallback = env.GROQ_API_KEY ? new GroqProvider() : null;

    logger.info(
      {
        primary: this.primary.name,
        fallback: this.fallback?.name ?? "none",
      },
      "AI service initialized",
    );
  }

  async analyze(
    scrubbedText: string,
  ): Promise<ScanResult & { provider: string }> {
    // Try primary
    try {
      const result = await this.primary.analyze(scrubbedText);
      return { ...result, provider: this.primary.name };
    } catch (primaryError) {
      logger.warn(
        { error: primaryError, provider: this.primary.name },
        "Primary AI provider failed — attempting fallback",
      );
    }

    // Try fallback
    if (this.fallback) {
      try {
        const result = await this.fallback.analyze(scrubbedText);
        return { ...result, provider: this.fallback.name };
      } catch (fallbackError) {
        logger.error(
          { error: fallbackError, provider: this.fallback.name },
          "Fallback AI provider also failed",
        );
      }
    }

    // Both failed
    throw new ServerError(
      "Detection service is temporarily unavailable. Please try again.",
    );
  }
}

// Singleton — instantiated once at startup
export const aiService = new AiService();
