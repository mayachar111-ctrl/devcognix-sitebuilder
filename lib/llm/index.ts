/**
 * generateJSON(): one entry point for every structured LLM call.
 *
 *  - provider picked by LLM_PROVIDER (gemini | anthropic), default gemini
 *  - model picked by tier ('generate' | 'edit'), env-overridable, with a
 *    fallback chain on 429 / overload (e.g. 3.8-flash → 3.6-flash → 3.5-flash-lite)
 *  - output parsed + validated with zod; one repair retry with the zod errors
 *  - optional disk cache (LLM_CACHE_DIR) so dev/test runs don't burn free quota
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { gemini } from "./gemini";
import { anthropic } from "./anthropic";
import { LLMError, type LLMProvider, type ModelTier } from "./types";

export { LLMError, friendlyMessage } from "./types";
export type { ModelTier } from "./types";

export function getProvider(): LLMProvider {
  return (process.env.LLM_PROVIDER ?? "gemini").toLowerCase() === "anthropic" ? anthropic : gemini;
}

export type GenerateJSONInput<S extends z.ZodTypeAny> = {
  system: string;
  user: string;
  schema: S;
  tier: ModelTier;
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
  /** Per-attempt timeout (default: generate 120 s, edit 60 s; env LLM_TIMEOUT_MS overrides both). */
  timeoutMs?: number;
};

export type Attempt = { model: string; ms: number; outcome: "ok" | "invalid" | "repaired" | string };
export type GenerateJSONResult<T> = {
  data: T;
  model: string;
  latencyMs: number;
  attempts: Attempt[];
  cached: boolean;
  usage?: { input?: number; output?: number };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function extractJSON(text: string): unknown {
  let t = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(t);
  if (fence) t = fence[1];
  try {
    return JSON.parse(t);
  } catch {
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
    throw new Error("Response was not JSON");
  }
}

function zodErrors(err: z.ZodError) {
  return err.issues.slice(0, 12).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

/* ------------------------------------------------------------ cache */
const cacheDir = () => process.env.LLM_CACHE_DIR;
const cacheKey = (parts: string[]) => createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 24);
async function cacheGet(key: string): Promise<{ text: string; model: string } | null> {
  const dir = cacheDir();
  if (!dir) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(dir, `${key}.json`), "utf8"));
  } catch {
    return null;
  }
}
async function cachePut(key: string, v: { text: string; model: string; tier: string; latencyMs: number }) {
  const dir = cacheDir();
  if (!dir) return;
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
  await fs.writeFile(path.join(dir, `${key}.json`), JSON.stringify({ ...v, savedAt: new Date().toISOString() })).catch(() => {});
}

/* ------------------------------------------------------------ main */
export async function generateJSON<S extends z.ZodTypeAny>(input: GenerateJSONInput<S>): Promise<GenerateJSONResult<z.output<S>>> {
  const provider = getProvider();
  const started = Date.now();
  const attempts: Attempt[] = [];
  const models = provider.models(input.tier);
  const key = cacheKey([provider.name, input.tier, models.join(","), input.system, input.user]);

  const cached = await cacheGet(key);
  if (cached) {
    try {
      const parsed = input.schema.safeParse(extractJSON(cached.text));
      if (parsed.success) return { data: parsed.data, model: cached.model, latencyMs: Date.now() - started, attempts: [{ model: cached.model, ms: 0, outcome: "cache" }], cached: true };
    } catch {}
  }

  const timeoutMs = input.timeoutMs ?? (Number(process.env.LLM_TIMEOUT_MS) || (input.tier === "generate" ? 120_000 : 60_000));
  let lastErr: unknown = null;
  let sawDaily = false;

  for (const model of models) {
    for (let overloadRetry = 0; overloadRetry < 2; overloadRetry++) {
      const t0 = Date.now();
      try {
        const res = await provider.call({ ...input, model, timeoutMs });
        let raw: unknown;
        let problem = "";
        try {
          raw = extractJSON(res.text);
          const parsed = input.schema.safeParse(raw);
          if (parsed.success) {
            attempts.push({ model, ms: Date.now() - t0, outcome: "ok" });
            await cachePut(key, { text: res.text, model: res.model, tier: input.tier, latencyMs: Date.now() - started });
            log(provider.name, input.tier, attempts, started, res.usage);
            return { data: parsed.data, model: res.model, latencyMs: Date.now() - started, attempts, cached: false, usage: res.usage };
          }
          problem = zodErrors(parsed.error);
        } catch (e) {
          problem = (e as Error).message;
        }
        attempts.push({ model, ms: Date.now() - t0, outcome: "invalid" });

        // One repair round on the same model.
        const t1 = Date.now();
        const repair = await provider.call({
          ...input,
          model,
          temperature: 0.2,
          timeoutMs,
          user: `${input.user}\n\n---\nYour previous reply could not be used:\n${problem}\n\nPrevious reply (may be truncated):\n${res.text.slice(0, 6000)}\n\nReturn the corrected, complete JSON object only.`,
        });
        const parsed2 = input.schema.safeParse(extractJSON(repair.text));
        if (parsed2.success) {
          attempts.push({ model, ms: Date.now() - t1, outcome: "repaired" });
          await cachePut(key, { text: repair.text, model: repair.model, tier: input.tier, latencyMs: Date.now() - started });
          log(provider.name, input.tier, attempts, started, repair.usage);
          return { data: parsed2.data, model: repair.model, latencyMs: Date.now() - started, attempts, cached: false, usage: repair.usage };
        }
        attempts.push({ model, ms: Date.now() - t1, outcome: "invalid" });
        throw new LLMError("invalid_output", "Output failed validation after repair", 200, zodErrors(parsed2.error));
      } catch (e) {
        lastErr = e;
        const err = e instanceof LLMError ? e : new LLMError("invalid_output", (e as Error).message);
        if (!(e instanceof LLMError)) lastErr = err;
        if (err.kind !== "invalid_output") attempts.push({ model, ms: Date.now() - t0, outcome: err.kind });
        if (err.kind === "daily_quota") sawDaily = true;
        if (input.signal?.aborted) throw err; // client went away: stop spending quota
        // Retry the same model once for a quick 503; a slow failure goes straight to the next model.
        if (err.kind === "overloaded" && overloadRetry === 0 && Date.now() - t0 < 30_000) {
          await sleep(3000);
          continue; // same model once more
        }
        if (err.fallbackable) break; // next model
        log(provider.name, input.tier, attempts, started);
        throw err;
      }
    }
  }
  log(provider.name, input.tier, attempts, started);
  if (sawDaily && lastErr instanceof LLMError && lastErr.fallbackable) throw new LLMError("daily_quota", "All models out of quota");
  throw lastErr ?? new LLMError("network", "No model available");
}

function log(provider: string, tier: string, attempts: Attempt[], started: number, usage?: { input?: number; output?: number }) {
  // Never log keys, proxy URLs or prompt text.
  console.info(`[llm] ${provider}/${tier} ${Date.now() - started}ms ` + attempts.map((a) => `${a.model}:${a.outcome}(${a.ms}ms)`).join(" → ") + (usage ? ` tokens in=${usage.input ?? "?"} out=${usage.output ?? "?"}` : ""));
}
