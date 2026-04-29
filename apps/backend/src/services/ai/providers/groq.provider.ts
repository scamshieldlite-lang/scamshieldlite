// apps/backend/src/services/pii/piiScrubber.service.ts

import Groq from "groq-sdk";
import type { AiProvider } from "../aiProvider.interface.js";
import type { ScanResult } from "@scamshieldlite/shared";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompt.js";
import { validateAiResponse } from "../aiResponse.validator.js";
import { env } from "@/utils/env.js";
import { logger } from "@/utils/logger.js";

export class GroqProvider implements AiProvider {
  readonly name = "groq";

  private readonly client: Groq;
  private readonly model: string;

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is required for Groq provider");
    }
    this.client = new Groq({ apiKey: env.GROQ_API_KEY });
    this.model = env.GROQ_MODEL;
  }

  async analyze(scrubbedText: string): Promise<ScanResult> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Groq request timed out")),
        env.AI_TIMEOUT_MS,
      ),
    );

    const responsePromise = this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(scrubbedText) },
      ],
      response_format: { type: "json_object" }, // Groq JSON mode
      temperature: 0.1,
      max_tokens: 1024,
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const text = response.choices[0]?.message?.content ?? "";

    logger.debug(
      { provider: this.name, responseLength: text.length },
      "AI response received",
    );

    const parsed = JSON.parse(text);
    return validateAiResponse(parsed);
  }
}
