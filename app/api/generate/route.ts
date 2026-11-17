import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSite } from "@/lib/ai/generate";
import { LLMError, friendlyMessage, getProvider } from "@/lib/llm";
import { CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const Body = z.object({ prompt: z.string().trim().min(8, "Describe your business in a sentence or two.").max(1500, "Keep the description under 1,500 characters.") });

/** POST /api/generate { prompt } → { site, meta } */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  try {
    const r = await generateSite(body.data.prompt, req.signal);
    return NextResponse.json({
      site: r.data,
      meta: { provider: getProvider().name, model: r.model, latencyMs: r.latencyMs, cached: r.cached, attempts: r.attempts, usage: r.usage, cost: CREDIT_COSTS.generate },
    });
  } catch (e) {
    const kind = e instanceof LLMError ? e.kind : "unknown";
    console.warn(`[generate] failed: ${kind}${e instanceof LLMError && e.status ? ` (${e.status})` : ""}`);
    const status = kind === "daily_quota" || kind === "rate_limit" ? 429 : kind === "config" || kind === "auth" ? 500 : 502;
    return NextResponse.json({ error: friendlyMessage(e), kind }, { status });
  }
}
