// apps/backend/src/services/ai/providers/gemini.provider.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiProvider } from "../aiProvider.interface";
import type { ScanResult } from "@scamshieldlite/shared";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompt";
import { validateAiResponse } from "../aiResponse.validator";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini-2.0-flash";

  private readonly client: GoogleGenerativeAI;
  private readonly modelName = "gemini-2.0-flash";

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required for Gemini provider");
    }
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async analyze(scrubbedText: string): Promise<ScanResult> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json", // Native JSON mode — no parsing needed
        temperature: 0.1, // Low temperature for consistent, deterministic output
        maxOutputTokens: 1024,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Gemini request timed out")),
        env.AI_TIMEOUT_MS,
      ),
    );

    const responsePromise = model.generateContent(
      buildUserPrompt(scrubbedText),
    );

    // A slightly cleaner way to handle the race result
    const raceResult = (await Promise.race([
      responsePromise,
      timeoutPromise,
    ])) as Awaited<typeof responsePromise>;
    const text = raceResult.response.text();

    logger.debug(
      { provider: this.name, responseLength: text.length },
      "AI response received",
    );

    const parsed = JSON.parse(text);
    return validateAiResponse(parsed);
  }
}
