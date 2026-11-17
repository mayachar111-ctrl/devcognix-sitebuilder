/**
 * Anthropic Claude provider — STUB, not exercised yet (no key configured).
 * Select with LLM_PROVIDER=anthropic and ANTHROPIC_API_KEY. Model ids are
 * env-configurable because exact ids change between releases.
 *
 * JSON is requested via a single forced tool call (tool_choice) so the reply
 * is always a JSON object; the zod validation/repair loop in ./index.ts is shared.
 */
import { LLMError, type LLMProvider, type ModelTier, type RawCallInput, type RawCallResult } from "./types";

export const anthropic: LLMProvider = {
  name: "anthropic",
  models(tier: ModelTier) {
    return tier === "generate"
      ? [process.env.ANTHROPIC_GENERATE_MODEL || "claude-sonnet-5-5", process.env.ANTHROPIC_EDIT_MODEL || "claude-haiku-5-5"]
      : [process.env.ANTHROPIC_EDIT_MODEL || "claude-haiku-5-5"];
  },
  async call(input: RawCallInput): Promise<RawCallResult> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new LLMError("config", "ANTHROPIC_API_KEY is not set");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      signal: input.signal ? AbortSignal.any([input.signal, AbortSignal.timeout(input.timeoutMs ?? 120_000)]) : AbortSignal.timeout(input.timeoutMs ?? 120_000),
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxOutputTokens ?? 16384,
        temperature: input.temperature ?? 0.8,
        system: input.system,
        messages: [{ role: "user", content: input.user }],
        tools: [{ name: "emit_json", description: "Return the result as JSON", input_schema: input.jsonSchema ?? { type: "object" } }],
        tool_choice: { type: "tool", name: "emit_json" },
      }),
    });
    const text = await res.text();
    if (res.status === 429) throw new LLMError("rate_limit", "Rate limited", 429);
    if (res.status === 529 || res.status >= 500) throw new LLMError("overloaded", "Overloaded", res.status);
    if (res.status === 401 || res.status === 403) throw new LLMError("auth", "Auth failed", res.status);
    if (!res.ok) throw new LLMError("bad_request", "Bad request", res.status, text.slice(0, 300));
    const j = JSON.parse(text);
    const tool = (j.content ?? []).find((c: { type: string }) => c.type === "tool_use");
    if (j.stop_reason === "max_tokens") throw new LLMError("truncated", "Output truncated");
    return { text: JSON.stringify(tool?.input ?? {}), model: j.model ?? input.model, usage: { input: j.usage?.input_tokens, output: j.usage?.output_tokens } };
  },
};
