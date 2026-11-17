/** Provider-agnostic LLM contracts. */
export type ModelTier = "generate" | "edit";

export type RawCallInput = {
  model: string;
  system: string;
  user: string;
  /** Optional JSON Schema hint for providers that support constrained decoding. */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
  /** Per-attempt timeout. */
  timeoutMs?: number;
};

export type RawCallResult = { text: string; model: string; usage?: { input?: number; output?: number } };

export interface LLMProvider {
  name: "gemini" | "anthropic";
  /** Ordered model list for a tier: first is preferred, the rest are fallbacks on rate limits/overload. */
  models(tier: ModelTier): string[];
  call(input: RawCallInput): Promise<RawCallResult>;
}

export type LLMErrorKind = "timeout" | "rate_limit" | "daily_quota" | "overloaded" | "bad_request" | "auth" | "truncated" | "blocked" | "network" | "invalid_output" | "config";

export class LLMError extends Error {
  constructor(public kind: LLMErrorKind, message: string, public status?: number, public detail?: string) {
    super(message);
    this.name = "LLMError";
  }
  /** Worth trying the next model in the chain? */
  get fallbackable() {
    return this.kind === "timeout" || this.kind === "rate_limit" || this.kind === "daily_quota" || this.kind === "overloaded" || this.kind === "truncated";
  }
}

/** Message safe to show to an end user. Never includes keys, URLs or raw provider text. */
export function friendlyMessage(e: unknown): string {
  if (e instanceof LLMError) {
    switch (e.kind) {
      case "daily_quota":
        return "The daily free AI limit has been reached. It resets tomorrow (Pacific time); please try again then.";
      case "rate_limit":
        return "The AI is getting too many requests right now. Wait a minute and try again.";
      case "overloaded":
      case "timeout":
        return "The AI model is busy at the moment. Please try again in a minute.";
      case "auth":
      case "config":
        return "The AI service isn't configured correctly. Check the API key settings.";
      case "blocked":
        return "The AI declined that request. Try rephrasing it.";
      case "invalid_output":
      case "truncated":
        return "The AI returned something we couldn't use. Please try again, maybe with a shorter request.";
      default:
        return "Something went wrong talking to the AI. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
