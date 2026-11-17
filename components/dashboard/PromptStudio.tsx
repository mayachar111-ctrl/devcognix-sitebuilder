"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useCredits } from "@/components/ai/useCredits";
import { CREDIT_COSTS } from "@/lib/credits";
import { saveGenerated } from "@/lib/localSites";
import type { SiteData } from "@/lib/schema";

const EXAMPLES = [
  "A yoga studio in Mangaluru with class schedule and pricing",
  "A CA firm in Bengaluru offering GST filing",
  "A family dental clinic in Kochi with online appointments",
  "A South Indian tiffin café in Mysuru with a menu and gallery",
];

const STEPS = ["Reading your brief", "Planning the sections", "Writing the copy", "Choosing colours and fonts", "Picking photos", "Putting it together"];

export default function PromptStudio() {
  const router = useRouter();
  const { balance, spend, canAfford } = useCredits();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const cost = CREDIT_COSTS.generate;

  useEffect(() => {
    if (!busy) return;
    const t0 = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(t);
  }, [busy]);

  const step = Math.min(STEPS.length - 1, Math.floor(elapsed / 5));

  async function generate() {
    const brief = prompt.trim();
    if (brief.length < 8) return setError("Describe your business in a sentence or two.");
    if (!canAfford(cost)) return setError(`You need ${cost} credits to generate a site.`);
    setError(null);
    setElapsed(0);
    setBusy(true);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: brief }), signal: abort.current.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.site) throw new Error(data.error ?? "Generation failed. Please try again.");
      const id = saveGenerated(data.site as SiteData, { prompt: brief, model: data.meta?.model ?? "", latencyMs: data.meta?.latencyMs ?? 0 });
      spend(data.meta?.cost ?? cost, "generate", id);
      router.push(`/editor/${id}`);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl text-left">
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-sm transition focus-within:border-black/25 focus-within:shadow-md">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
          }}
          disabled={busy}
          rows={3}
          maxLength={1500}
          aria-label="Describe your business"
          placeholder="e.g. A physiotherapy clinic in Pune with online booking, three treatment packages and a friendly tone…"
          className="block w-full resize-none bg-transparent px-4 pt-3 text-[15px] leading-relaxed outline-none placeholder:text-black/35 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-2">
          <span className="pl-2 text-xs text-black/40">{prompt.length > 0 ? `${prompt.length}/1500` : "Name the business, the city and what you offer"}</span>
          <button
            onClick={generate}
            disabled={busy || prompt.trim().length < 8}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111118] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            <Icon name="sparkles" className="h-4 w-4" />
            Generate
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-medium">{cost} credits</span>
          </button>
        </div>

        <AnimatePresence>
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center gap-5 bg-white/95 px-6 backdrop-blur-sm" role="status" aria-live="polite">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                <motion.span className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }} />
                <span className="absolute inset-[3px] rounded-full bg-white" />
                <Icon name="sparkles" className="relative h-5 w-5 text-fuchsia-600" />
              </div>
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                  <motion.p key={step} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="text-[15px] font-semibold">
                    {STEPS[step]}…
                  </motion.p>
                </AnimatePresence>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" animate={{ width: `${Math.min(94, 8 + elapsed * 2.4)}%` }} transition={{ ease: "easeOut", duration: 0.6 }} />
                </div>
                <p className="mt-1.5 text-xs text-black/45">{elapsed}s · usually 20–60 seconds on the free AI tier</p>
              </div>
              <button onClick={() => abort.current?.abort()} className="rounded-lg px-3 py-1.5 text-xs font-medium text-black/50 hover:bg-black/5">Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" data-testid="generate-error" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button key={ex} disabled={busy} onClick={() => setPrompt(ex)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-black/60 transition hover:border-black/25 hover:text-black disabled:opacity-50">
            {ex}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-black/40">
        {balance === null ? "" : `${balance} demo credits left · `}Generating a site costs {cost} credits, each AI edit costs {CREDIT_COSTS.edit}.
      </p>
    </div>
  );
}
