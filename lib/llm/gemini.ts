/**
 * Google Gemini (Generative Language API, REST v1beta).
 *
 * Auth: `x-goog-api-key: $GEMINI_API_KEY`. In the DevCognix sandbox the env var
 * is a sentinel and an egress proxy injects the real key, so when HTTPS_PROXY is
 * set we route through it with undici (Node's fetch ignores proxy env vars).
 */
import { LLMError, type LLMProvider, type ModelTier, type RawCallInput, type RawCallResult } from "./types";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const list = (v: string | undefined, d: string[]) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : d);

// Schemas Gemini rejected ("too many states" etc.) are remembered per process so we stop sending them.
const schemaRejected = new Set<string>();
const thinkingRejected = new Set<string>();

async function proxiedFetch(url: string, init: RequestInit): Promise<Response> {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy) return fetch(url, init);
  const undici = await import("undici");
  const res = await undici.fetch(url, { ...(init as object), dispatcher: new undici.EnvHttpProxyAgent() } as never);
  return res as unknown as Response;
}

function classify(status: number, body: string): LLMError {
  let msg = "";
  try {
    msg = JSON.parse(body)?.error?.message ?? "";
  } catch {}
  const short = msg.slice(0, 300);
  if (status === 429) {
    const daily = /per ?day|PerDay|daily/i.test(body);
    return new LLMError(daily ? "daily_quota" : "rate_limit", daily ? "Daily quota exhausted" : "Rate limited", status, short);
  }
  if (status === 503 || status === 500 || status === 502 || status === 504) return new LLMError("overloaded", "Model overloaded", status, short);
  if (status === 401 || status === 403) return new LLMError("auth", "Auth failed", status, short);
  return new LLMError("bad_request", "Bad request", status, short);
}

export const gemini: LLMProvider = {
  name: "gemini",
  models(tier: ModelTier) {
    if (tier === "generate")
      return [process.env.GENERATE_MODEL || "gemini-3.8-flash", ...list(process.env.GENERATE_FALLBACK_MODELS, ["gemini-3.6-flash", "gemini-3.5-flash-lite"])];
    return [process.env.EDIT_MODEL || "gemini-3.5-flash-lite", ...list(process.env.EDIT_FALLBACK_MODELS, ["gemini-3.1-flash-lite", "gemini-flash-lite-latest"])];
  },
  async call(input: RawCallInput): Promise<RawCallResult> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new LLMError("config", "GEMINI_API_KEY is not set");
    const useSchema = !!input.jsonSchema && !schemaRejected.has(input.model);
    const useThinking = !thinkingRejected.has(input.model);
    const body = {
      systemInstruction: { parts: [{ text: input.system }] },
      contents: [{ role: "user", parts: [{ text: input.user }] }],
      generationConfig: {
        responseMimeType: "application/json",
        ...(useSchema ? { responseJsonSchema: input.jsonSchema } : {}),
        temperature: input.temperature ?? 0.8,
        maxOutputTokens: input.maxOutputTokens ?? 16384,
        ...(useThinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    };
    let res: Response;
    const timeout = AbortSignal.timeout(input.timeoutMs ?? 120_000);
    const signal = input.signal ? AbortSignal.any([input.signal, timeout]) : timeout;
    try {
      res = await proxiedFetch(`${BASE}/${encodeURIComponent(input.model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal,
      });
    } catch (e) {
      if (timeout.aborted && !input.signal?.aborted) throw new LLMError("timeout", "Gemini call timed out");
      throw new LLMError("network", "Network error calling Gemini", undefined, (e as Error).name);
    }
    const text = await res.text();
    if (!res.ok) {
      const err = classify(res.status, text);
      // Self-heal: drop optional features this model refuses, then retry once.
      if (err.kind === "bad_request" && useSchema && /schema|states/i.test(err.detail ?? "")) {
        schemaRejected.add(input.model);
        return gemini.call(input);
      }
      if (err.kind === "bad_request" && useThinking && /thinking/i.test(err.detail ?? "")) {
        thinkingRejected.add(input.model);
        return gemini.call(input);
      }
      throw err;
    }
    const j = JSON.parse(text);
    const cand = j.candidates?.[0];
    if (!cand) throw new LLMError("blocked", "No candidates", 200, j.promptFeedback?.blockReason);
    const out = (cand.content?.parts ?? []).filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? "").join("");
    if (cand.finishReason === "MAX_TOKENS") throw new LLMError("truncated", "Output truncated", 200);
    if (cand.finishReason && !["STOP", "MAX_TOKENS"].includes(cand.finishReason) && !out) throw new LLMError("blocked", "Blocked", 200, cand.finishReason);
    return {
      text: out,
      model: j.modelVersion ?? input.model,
      usage: { input: j.usageMetadata?.promptTokenCount, output: j.usageMetadata?.candidatesTokenCount },
    };
  },
};
