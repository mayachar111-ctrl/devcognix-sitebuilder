import { NextResponse } from "next/server";
import { z } from "zod";
import { editSite } from "@/lib/ai/edit";
import { safeParseSite, type SiteData } from "@/lib/schema";
import { LLMError, friendlyMessage, getProvider } from "@/lib/llm";
import { CREDIT_COSTS } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const Body = z.object({
  site: z.unknown(),
  pageSlug: z.string().default("home"),
  instruction: z.string().trim().min(2).max(1000),
  selectedSectionId: z.string().nullish(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(600) })).max(10).optional(),
});

/** POST /api/edit { site, pageSlug, instruction, selectedSectionId? } → { reply, patch (RFC 6902), focusId, meta } */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const parsed = safeParseSite(body.data.site);
  if (!parsed.success) return NextResponse.json({ error: "The site data is invalid." }, { status: 400 });
  try {
    const r = await editSite({
      site: parsed.data as unknown as SiteData,
      pageSlug: body.data.pageSlug,
      instruction: body.data.instruction,
      selectedSectionId: body.data.selectedSectionId,
      history: body.data.history,
      signal: req.signal,
    });
    const changed = r.data.patch.length > 0;
    return NextResponse.json({
      reply: r.data.reply,
      patch: r.data.patch,
      focusId: r.data.focusId,
      summary: r.data.summary,
      meta: { provider: getProvider().name, model: r.model, latencyMs: r.latencyMs, cached: r.cached, attempts: r.attempts, cost: changed ? CREDIT_COSTS.edit : 0 },
    });
  } catch (e) {
    const kind = e instanceof LLMError ? e.kind : "unknown";
    console.warn(`[edit] failed: ${kind}${e instanceof LLMError && e.status ? ` (${e.status})` : ""}`);
    const status = kind === "daily_quota" || kind === "rate_limit" ? 429 : kind === "config" || kind === "auth" ? 500 : 502;
    return NextResponse.json({ error: friendlyMessage(e), kind }, { status });
  }
}
