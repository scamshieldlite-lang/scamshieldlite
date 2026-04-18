import type { AiProvider } from "./aiProvider.interface";
import type { ScanResult } from "@scamshieldlite/shared";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { ServerError } from "@/utils/errors";

class AiService {
  private providers: AiProvider[];

  constructor() {
    // Build the provider chain based on what keys are configured.
    // Order: primary first, then fallbacks in sequence.
    // Only providers with keys configured are included.
    const chain: AiProvider[] = [];

    // Primary — controlled by AI_PROVIDER env var
    switch (env.AI_PROVIDER) {
      case "openai":
        if (env.OPENAI_API_KEY) chain.push(new OpenAIProvider());
        if (env.GROQ_API_KEY) chain.push(new GroqProvider());
        if (env.GEMINI_API_KEY) chain.push(new GeminiProvider());
        break;
      case "groq":
        if (env.GROQ_API_KEY) chain.push(new GroqProvider());
        if (env.GEMINI_API_KEY) chain.push(new GeminiProvider());
        if (env.OPENAI_API_KEY) chain.push(new OpenAIProvider());
        break;
      case "gemini":
      default:
        if (env.GEMINI_API_KEY) chain.push(new GeminiProvider());
        if (env.GROQ_API_KEY) chain.push(new GroqProvider());
        if (env.OPENAI_API_KEY) chain.push(new OpenAIProvider());
        break;
    }

    if (chain.length === 0) {
      throw new Error(
        "No AI providers configured. Set at least one of: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY",
      );
    }

    this.providers = chain;

    logger.info(
      {
        primary: chain[0]?.name,
        fallback: chain[1]?.name ?? "none",
        reserve: chain[2]?.name ?? "none",
        totalProviders: chain.length,
      },
      "AI service initialized",
    );
  }

  async analyze(
    scrubbedText: string,
  ): Promise<ScanResult & { provider: string }> {
    const errors: string[] = [];

    // Try each provider in sequence until one succeeds
    for (const provider of this.providers) {
      try {
        const result = await provider.analyze(scrubbedText);
        return { ...result, provider: provider.name };
      } catch (error: any) {
        const message = error?.message ?? String(error);
        errors.push(`${provider.name}: ${message}`);

        logger.warn(
          {
            provider: provider.name,
            error: message,
            nextProvider:
              this.providers[this.providers.indexOf(provider) + 1]?.name ??
              "none — all providers exhausted",
          },
          "AI provider failed — trying next",
        );
      }
    }

    // All providers failed
    logger.error({ errors }, "All AI providers failed");

    throw new ServerError(
      "Detection service is temporarily unavailable. Please try again in a moment.",
    );
  }
}

export const aiService = new AiService();
