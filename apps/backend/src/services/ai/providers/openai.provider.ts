import OpenAI from "openai";
import type { AiProvider } from "../aiProvider.interface";
import type { ScanResult } from "@scamshieldlite/shared";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompt";
import { validateAiResponse } from "../aiResponse.validator";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export class OpenAIProvider implements AiProvider {
  readonly name: string;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for OpenAI provider");
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    // Use the model specified in env — defaults to gpt-4o-mini
    // gpt-4o-mini: better structured JSON, more reliable for scam detection
    // gpt-5-nano: newer, cheaper, but uses Responses API (different format)
    this.model = env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.name = `openai-${this.model}`;
  }

  async analyze(scrubbedText: string): Promise<ScanResult> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("OpenAI request timed out")),
        env.AI_TIMEOUT_MS,
      ),
    );

    // Use Chat Completions API — works for both gpt-4o-mini and gpt-5-nano
    // This is the most reliable path for JSON-structured output
    const responsePromise = this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(scrubbedText) },
      ],
      response_format: { type: "json_object" },
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
