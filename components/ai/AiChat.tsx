"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useCredits } from "./useCredits";
import { CREDIT_COSTS } from "@/lib/credits";
import type { Operation } from "@/lib/jsonpatch";
import type { SiteData } from "@/lib/schema";

type Msg = {
  role: "user" | "assistant";
  text: string;
  at: number;
  error?: boolean;
  applied?: boolean;
  undone?: boolean;
  meta?: { model?: string; latencyMs?: number; cost?: number; ops?: number };
};

const SUGGESTIONS_SITE = ["Make the hero darker", "Add a pricing section", "Change the colours to green", "Add an FAQ section"];
const SUGGESTIONS_SECTION = ["Rewrite this for a dentist", "Make this shorter and punchier", "Make this section dark", "Add two more items"];

type Props = {
  siteId: string;
  getSite: () => SiteData;
  pageSlug: string;
  selected: { id: string; label: string } | null;
  onClearSelection: () => void;
  /** Applies the patch as one undoable step; throws if it doesn't apply. */
  applyPatch: (patch: Operation[]) => void;
  undo: () => void;
  onFocus: (id: string | null) => void;
};

export default function AiChat({ siteId, getSite, pageSlug, selected, onClearSelection, applyPatch, undo, onFocus }: Props) {
  const key = `dc-chat:v1:${siteId}`;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { balance, spend, canAfford } = useCredits();
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setMsgs(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {}
  }, [key]);
  useEffect(() => {
    if (msgs.length) localStorage.setItem(key, JSON.stringify(msgs.slice(-40)));
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, key, busy]);

  const lastApplied = [...msgs].reverse().findIndex((m) => m.applied && !m.undone);
  const lastAppliedIdx = lastApplied < 0 ? -1 : msgs.length - 1 - lastApplied;

  async function send(text: string) {
    const instruction = text.trim();
    if (!instruction || busy) return;
    if (!canAfford(CREDIT_COSTS.edit)) {
      setMsgs((m) => [...m, { role: "assistant", text: "You're out of demo credits. Click the credits counter to top up.", at: Date.now(), error: true }]);
      return;
    }
    const history = msgs.filter((m) => !m.error).slice(-4).map((m) => ({ role: m.role, text: m.text.slice(0, 600) }));
    setMsgs((m) => [...m, { role: "user", text: instruction, at: Date.now() }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ site: getSite(), pageSlug, instruction, selectedSectionId: selected?.id ?? null, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "The AI edit failed. Please try again.");
      const patch = (data.patch ?? []) as Operation[];
      let applied = false;
      if (patch.length) {
        applyPatch(patch);
        applied = true;
        spend(data.meta?.cost ?? CREDIT_COSTS.edit, "edit", siteId);
        onFocus(data.focusId ?? null);
      }
      setMsgs((m) => [...m, { role: "assistant", text: data.reply || (applied ? "Done." : "No changes needed."), at: Date.now(), applied, meta: { model: data.meta?.model, latencyMs: data.meta?.latencyMs, cost: applied ? data.meta?.cost : 0, ops: patch.length } }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: (e as Error).message, at: Date.now(), error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
        </span>
        <span className="text-[12px] font-semibold">AI edits</span>
        <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500" title="Demo credits">
          {balance ?? "…"} credits
        </span>
      </div>

      <div ref={list} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-2" data-testid="ai-chat-log">
        {msgs.length === 0 && !busy && (
          <p className="rounded-lg bg-neutral-50 px-3 py-2 text-[12px] leading-relaxed text-neutral-500">
            Tell the AI what to change. Select a section first to edit just that part. Each applied edit costs {CREDIT_COSTS.edit} credit and can be undone.
          </p>
        )}
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div key={m.at + "-" + i} data-msg={m.role} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
                  m.role === "user" ? "rounded-br-md bg-neutral-900 text-white" : m.error ? "rounded-bl-md border border-amber-200 bg-amber-50 text-amber-900" : "rounded-bl-md bg-neutral-100 text-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.role === "assistant" && !m.error && m.meta && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-neutral-500">
                    {m.applied ? <span className={m.undone ? "line-through" : "text-emerald-700"}>{m.undone ? "Undone" : `Applied · −${m.meta.cost ?? 1} credit`}</span> : <span>No changes</span>}
                    {m.meta.latencyMs ? <span>{(m.meta.latencyMs / 1000).toFixed(1)}s</span> : null}
                    {i === lastAppliedIdx && (
                      <button
                        onClick={() => {
                          undo();
                          setMsgs((all) => all.map((x, j) => (j === i ? { ...x, undone: true } : x)));
                        }}
                        className="rounded-md border border-neutral-300 bg-white px-1.5 py-0.5 font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        ↶ Undo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="flex items-center gap-2 px-1 py-1 text-[12px] text-neutral-500" role="status">
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }} />
              ))}
            </span>
            Editing your site…
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 p-3">
        {selected && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px]">
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Editing: {selected.label}</span>
            <button onClick={onClearSelection} className="text-neutral-400 hover:text-neutral-700" aria-label="Edit whole site instead">
              whole site instead
            </button>
          </div>
        )}
        <div className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]">
          {(selected ? SUGGESTIONS_SECTION : SUGGESTIONS_SITE).map((s) => (
            <button key={s} disabled={busy} onClick={() => send(s)} className="shrink-0 whitespace-nowrap rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 transition hover:border-violet-400 hover:text-violet-700 disabled:opacity-40">
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            maxLength={1000}
            disabled={busy}
            aria-label="Describe a change"
            placeholder={selected ? `Change the ${selected.label.toLowerCase()}…` : "“Make the hero darker and add a pricing section”"}
            className="flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] outline-none placeholder:text-neutral-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
          />
          <button onClick={() => send(input)} disabled={busy || !input.trim()} className="self-end rounded-lg bg-neutral-900 px-3 py-2 text-white transition hover:bg-black disabled:opacity-30" aria-label="Send">
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
