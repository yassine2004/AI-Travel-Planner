import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { z } from "zod";
import type { LLMProvider } from "./provider.js";

export class GeminiProvider implements LLMProvider {
  // Model id as of the free tier in AI Studio. If Google renames/retires it,
  // check https://aistudio.google.com for the current Flash model id.
  constructor(private readonly model = "gemini-3.6-flash") {}

  async generateStructured<T>(params: { schema: z.ZodType<T>; system: string; prompt: string }): Promise<T> {
    const { object } = await generateObject({
      model: google(this.model),
      schema: params.schema,
      system: params.system,
      prompt: params.prompt,
      temperature: 0.3, // low: we want a sensible schedule, not creative writing
    });
    return object;
  }
}
