import { createServerFn } from "@tanstack/react-start";

import {
  OUTPUT_SCHEMAS,
  SYSTEM_PROMPTS,
  buildUserPrompt,
  formatResult,
  toolRequestSchema,
  type ToolResponse,
} from "./ai-tools";

const MODEL = "openai/gpt-6-astra";

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => toolRequestSchema.parse(data))
  .handler(async ({ data }): Promise<ToolResponse> => {
    if (!process.env["LOVABLE_API_KEY"]) {
      return {
        ok: false,
        kind: "setup",
        message:
          "Live AI isn't set up for this app yet. Enable Lovable AI for this project, then try again. No content was generated.",
      };
    }

    const sdk = await import("@lovable.dev/ai-gateway");
    try {
      const response = await sdk.generateResponse({
        model: MODEL,
        instructions: SYSTEM_PROMPTS[data.tool],
        input: [{ role: "user", content: buildUserPrompt(data) }],
        text: {
          format: {
            type: "json_schema",
            name: `${data.tool}_result`,
            schema: OUTPUT_SCHEMAS[data.tool],
            strict: true,
          },
        },
      });

      let raw = "";
      let refusal = "";
      for (const item of response.output ?? []) {
        if (item.type !== "message") continue;
        for (const part of item.content) {
          if (part.type === "output_text") raw += part.text;
          else if (part.type === "refusal") refusal += part.refusal;
        }
      }
      if (!raw && refusal) {
        return { ok: false, kind: "refusal", message: `The AI declined this request: ${refusal}` };
      }
      const parsed = JSON.parse(raw) as unknown;
      const { text, title } = formatResult(data.tool, parsed);
      return { ok: true, tool: data.tool, text, title };
    } catch (error) {
      console.error("AI tool failed", data.tool, error);
      if (error instanceof sdk.PaymentRequiredError) {
        return {
          ok: false,
          kind: "credits",
          message: "AI credits have run out for this workspace. Add credits, then try again.",
        };
      }
      if (error instanceof sdk.RateLimitError) {
        return {
          ok: false,
          kind: "rate",
          message: "The AI is receiving too many requests right now. Please wait a moment and try again.",
        };
      }
      if (error instanceof sdk.ConfigurationError || error instanceof sdk.AuthenticationError) {
        return {
          ok: false,
          kind: "setup",
          message:
            "Live AI isn't configured correctly for this app. Check that Lovable AI is enabled, then try again.",
        };
      }
      if (error instanceof sdk.RequestRejectedError) {
        return {
          ok: false,
          kind: "invalid",
          message: "The AI couldn't process this input. Try shortening or rephrasing it.",
        };
      }
      return {
        ok: false,
        kind: "generic",
        message: "Something went wrong while generating. Your input is safe — please try again.",
      };
    }
  });
