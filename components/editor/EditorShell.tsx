"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import SiteRenderer from "@/components/renderer/SiteRenderer";
import PropsForm from "./PropsForm";
import ThemePanel from "./ThemePanel";
import { useSiteStore } from "./useSiteStore";
import { SECTION_PROPS, type SectionType, type SiteData } from "@/lib/schema";
import { SECTION_LIBRARY, withDefaults } from "@/lib/defaults";
import Icon from "@/components/ui/Icon";
import AiChat from "@/components/ai/AiChat";
import { SECTION_TONES, type SectionTone } from "@/lib/schema";

const DESIGN_WIDTH = 1280;
const labelOf = (t: SectionType) => SECTION_LIBRARY.find((s) => s.type === t)?.label ?? t;

function IconBtn({ onClick, title, children, disabled, danger }: { onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid h-7 w-7 place-items-center rounded-md text-neutral-500 transition disabled:opacity-30 ${danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-neutral-100 hover:text-neutral-900"}`}
    >
      {children}
    </button>
  );
}

export default function EditorShell({ templateId, templateName, initial, subtitle }: { templateId: string; templateName: string; initial: SiteData; subtitle?: string }) {
  const store = useSiteStore(templateId, initial);
  const { site } = store;
  const [pageSlug, setPageSlug] = useState(initial.pages[0].slug);
  const page = site.pages.find((p) => p.slug === pageSlug) ?? site.pages[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"section" | "theme">("theme");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const selected = page.sections.find((s) => s.id === selectedId) ?? null;

  // Canvas zoom-to-fit: the site renders at desktop width and is scaled down.
  const canvasBox = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.6);
  useEffect(() => {
    if (!canvasBox.current) return;
    const ro = new ResizeObserver(([e]) => setZoom(Math.min(1, (e.contentRect.width - 48) / DESIGN_WIDTH)));
    ro.observe(canvasBox.current);
    return () => ro.disconnect();
  }, []);

  const select = (id: string | null, scroll = false) => {
    setSelectedId(id);
    setTab(id ? "section" : "theme");
    if (id && scroll) {
      setTimeout(() => document.querySelector(`[data-section-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, select");
      if (e.key === "Escape") select(null);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ids = useMemo(() => page.sections.map((s) => s.id), [page.sections]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof SECTION_LIBRARY> = {};
    for (const s of SECTION_LIBRARY) (g[s.category] ??= []).push(s);
    return g;
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-100 font-[Inter,ui-sans-serif,system-ui] text-neutral-900">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-900 text-sm font-black text-white" title="Back to dashboard">D</Link>
          <div className="min-w-0">
            <input value={site.name} onChange={(e) => store.setName(e.target.value)} className="w-56 truncate rounded px-1 text-sm font-semibold outline-none hover:bg-neutral-100 focus:bg-neutral-100" />
            <p className="px-1 text-[11px] text-neutral-400">{subtitle ?? `From template · ${templateName}`}</p>
          </div>
          {site.pages.length > 1 && (
            <select value={page.slug} onChange={(e) => { setPageSlug(e.target.value); select(null); }} className="ml-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-[13px]">
              {site.pages.map((p) => (
                <option key={p.slug} value={p.slug}>{p.slug === "home" ? "Home page" : `/${p.slug}`}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden text-[11px] text-neutral-400 sm:inline">{store.savedAt ? "Saved locally" : store.hydrated ? "Ready" : "Loading…"}</span>
          <IconBtn title="Undo (⌘Z)" onClick={store.undo} disabled={!store.canUndo}>↶</IconBtn>
          <IconBtn title="Redo (⇧⌘Z)" onClick={store.redo} disabled={!store.canRedo}>↷</IconBtn>
          <button
            onClick={() => {
              if (confirm("Discard your changes and restore the original version?")) {
                store.reset(initial);
                select(null);
              }
            }}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Reset
          </button>
          <a href={`/preview/${templateId}?local=1${page.slug !== "home" ? `&page=${page.slug}` : ""}`} target="_blank" rel="noreferrer" className="rounded-lg border border-neutral-200 px-3 py-1.5 text-[13px] font-medium hover:bg-neutral-50">Preview</a>
          <button disabled title="Publishing arrives in Phase 3" className="rounded-lg bg-neutral-900 px-4 py-1.5 text-[13px] font-semibold text-white opacity-40">Publish</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr_340px]">
        {/* Left: sections */}
        <aside className="flex min-h-0 flex-col border-r border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">Sections</h2>
            <span className="text-[11px] text-neutral-400">{page.sections.length}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <Reorder.Group axis="y" values={ids} onReorder={(next) => store.reorder(page.slug, next as string[])} className="space-y-1">
              {page.sections.map((s, i) => (
                <Reorder.Item key={s.id} value={s.id} className="list-none">
                  <div
                    onClick={() => select(s.id, true)}
                    className={`group flex cursor-grab items-center gap-2 rounded-lg border px-2 py-2 active:cursor-grabbing ${selectedId === s.id ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-neutral-50"}`}
                  >
                    <span className="select-none text-[10px] leading-none tracking-tighter text-neutral-300">⋮⋮</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-medium ${selectedId === s.id ? "text-blue-700" : "text-neutral-800"}`}>{labelOf(s.type)}</span>
                      <span className="block truncate font-mono text-[10px] text-neutral-400">#{s.id}</span>
                    </span>
                    <span className="flex opacity-0 transition group-hover:opacity-100">
                      <IconBtn title="Move up" disabled={i === 0} onClick={() => store.move(page.slug, s.id, -1)}>↑</IconBtn>
                      <IconBtn title="Move down" disabled={i === page.sections.length - 1} onClick={() => store.move(page.slug, s.id, 1)}>↓</IconBtn>
                      <IconBtn title="Delete" danger disabled={page.sections.length <= 1} onClick={() => { store.remove(page.slug, s.id); if (selectedId === s.id) select(null); }}>
                        <Icon name="close" className="h-3.5 w-3.5" />
                      </IconBtn>
                    </span>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <button onClick={() => setLibraryOpen(true)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 text-[13px] font-medium text-neutral-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700">
              <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Add section
            </button>
          </div>
          {/* AI chat */}
          <div className="flex h-[48%] min-h-[300px] flex-col border-t border-neutral-200" data-testid="ai-chat">
            <AiChat
              siteId={templateId}
              getSite={store.current}
              pageSlug={page.slug}
              selected={selected ? { id: selected.id, label: labelOf(selected.type) } : null}
              onClearSelection={() => select(null)}
              applyPatch={store.applyPatch}
              undo={store.undo}
              onFocus={(id) => {
                if (id && site.pages.length) select(id, true);
              }}
            />
          </div>
        </aside>

        {/* Center: canvas */}
        <main ref={canvasBox} className="relative min-h-0 overflow-y-auto overflow-x-hidden" onClick={(e) => { if (e.target === e.currentTarget) select(null); }}>
          <div className="px-6 py-6" onClick={(e) => { if (e.target === e.currentTarget) select(null); }}>
            <div className="mx-auto overflow-clip rounded-xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5" style={{ width: DESIGN_WIDTH, zoom }}>
              <SiteRenderer site={site} pageSlug={page.slug} editable selectedId={selectedId} onSelect={(id) => select(id)} />
            </div>
            <p className="mt-3 text-center text-[11px] text-neutral-400">Desktop · {Math.round(zoom * 100)}% · click any section to edit</p>
          </div>
        </main>

        {/* Right: inspector */}
        <aside className="flex min-h-0 flex-col border-l border-neutral-200 bg-white">
          <div className="flex gap-1 border-b border-neutral-200 p-2">
            {(["section", "theme"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md py-1.5 text-[12px] font-semibold capitalize ${tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                {t === "section" ? "Section" : "Theme"}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "theme" ? (
              <ThemePanel theme={site.theme} onChange={store.setTheme} />
            ) : selected ? (
              <div>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[15px] font-semibold">{labelOf(selected.type)}</h3>
                    <p className="font-mono text-[11px] text-neutral-400">#{selected.id}</p>
                  </div>
                  <div className="flex">
                    <IconBtn title="Duplicate" onClick={() => { const id = store.duplicate(page.slug, selected.id); if (id) select(id, true); }}>
                      <Icon name="copy" className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="Delete" danger disabled={page.sections.length <= 1} onClick={() => { store.remove(page.slug, selected.id); select(null); }}>
                      <Icon name="close" className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
                <label className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-[12px] font-medium text-neutral-600">
                  Section colours
                  <select
                    value={selected.tone ?? "auto"}
                    onChange={(e) => store.setTone(page.slug, selected.id, e.target.value as SectionTone)}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[12px]"
                  >
                    {SECTION_TONES.map((t) => (
                      <option key={t} value={t}>{t === "auto" ? "Site theme" : t === "dark" ? "Dark band" : "Light band"}</option>
                    ))}
                  </select>
                </label>
                <PropsForm
                  key={selected.id}
                  schema={SECTION_PROPS[selected.type] as never}
                  value={withDefaults(selected.type, selected.props as never) as Record<string, unknown>}
                  onChange={(v) => store.updateProps(page.slug, selected.id, v)}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400"><Icon name="layers" /></span>
                <p className="text-[13px] font-medium text-neutral-700">No section selected</p>
                <p className="mt-1 text-[12px] text-neutral-400">Click a section on the canvas or in the list to edit its content.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Section library */}
      <AnimatePresence>
        {libraryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6 backdrop-blur-sm" onClick={() => setLibraryOpen(false)}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Add a section</h3>
                  <p className="text-[13px] text-neutral-500">{selected ? `Inserted after “${labelOf(selected.type)}”` : "Inserted before the footer"}</p>
                </div>
                <button onClick={() => setLibraryOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Close"><Icon name="close" /></button>
              </div>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="mb-5">
                  <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{cat}</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {items.map((s) => (
                      <button
                        key={s.type}
                        onClick={() => {
                          const id = store.add(page.slug, s.type, selectedId);
                          setLibraryOpen(false);
                          select(id, true);
                        }}
                        className="rounded-xl border border-neutral-200 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md"
                      >
                        <span className="block text-[13px] font-semibold">{s.label}</span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-neutral-500">{s.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
