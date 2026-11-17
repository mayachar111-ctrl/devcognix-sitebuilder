"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { safeParseSite, type SectionData, type SectionTone, type SectionType, type SiteData, type Theme } from "@/lib/schema";
import { newSection } from "@/lib/defaults";
import { applyPatch, type Operation } from "@/lib/jsonpatch";

export const storageKey = (templateId: string) => `dc-site:v1:${templateId}`;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * Editor state: one SiteData in memory, persisted to localStorage (debounced),
 * with coalesced undo/redo. Phase 3 swaps localStorage for the Site table.
 */
export function useSiteStore(templateId: string, initial: SiteData) {
  const [site, setSite] = useState<SiteData>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const past = useRef<SiteData[]>([]);
  const future = useRef<SiteData[]>([]);
  const lastPush = useRef(0);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(templateId));
      if (raw) {
        const parsed = safeParseSite(JSON.parse(raw));
        if (parsed.success) setSite(parsed.data as unknown as SiteData);
      }
    } catch {}
    setHydrated(true);
  }, [templateId]);

  // Persist (debounced).
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      localStorage.setItem(storageKey(templateId), JSON.stringify(site));
      setSavedAt(Date.now());
    }, 400);
    return () => clearTimeout(t);
  }, [site, hydrated, templateId]);

  const siteRef = useRef(site);
  siteRef.current = site;

  const commit = useCallback((mutator: (draft: SiteData) => void, coalesce = false) => {
    const prev = siteRef.current;
    const now = Date.now();
    if (!coalesce || now - lastPush.current > 800) {
      past.current = [...past.current.slice(-49), prev];
      future.current = [];
    }
    lastPush.current = now;
    const draft = clone(prev);
    mutator(draft);
    siteRef.current = draft;
    setSite(draft);
  }, []);

  const pageIndex = (draft: SiteData, slug: string) => Math.max(0, draft.pages.findIndex((p) => p.slug === slug));

  const api = {
    site,
    hydrated,
    savedAt,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    undo: () => {
      const prev = past.current.pop();
      if (!prev) return;
      future.current.push(siteRef.current);
      siteRef.current = prev;
      setSite(prev);
      lastPush.current = 0;
    },
    redo: () => {
      const next = future.current.pop();
      if (!next) return;
      past.current.push(siteRef.current);
      siteRef.current = next;
      setSite(next);
      lastPush.current = 0;
    },
    updateProps: (slug: string, id: string, props: Record<string, unknown>) =>
      commit((d) => {
        const s = d.pages[pageIndex(d, slug)].sections.find((x) => x.id === id);
        if (s) s.props = props as never;
      }, true),
    move: (slug: string, id: string, dir: -1 | 1) =>
      commit((d) => {
        const arr = d.pages[pageIndex(d, slug)].sections;
        const i = arr.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }),
    reorder: (slug: string, ids: string[]) =>
      commit((d) => {
        const page = d.pages[pageIndex(d, slug)];
        const byId = new Map(page.sections.map((s) => [s.id, s]));
        page.sections = ids.map((id) => byId.get(id)).filter(Boolean) as SectionData[];
      }, true),
    remove: (slug: string, id: string) =>
      commit((d) => {
        const page = d.pages[pageIndex(d, slug)];
        if (page.sections.length <= 1) return;
        page.sections = page.sections.filter((s) => s.id !== id);
      }),
    duplicate: (slug: string, id: string): string | null => {
      const cur = siteRef.current.pages[pageIndex(siteRef.current, slug)].sections;
      const src = cur.find((x) => x.id === id);
      if (!src) return null;
      let n = 1;
      while (cur.some((s) => s.id === `${id}-copy${n}`)) n++;
      const newId = `${id}-copy${n}`;
      commit((d) => {
        const arr = d.pages[pageIndex(d, slug)].sections;
        const i = arr.findIndex((x) => x.id === id);
        arr.splice(i + 1, 0, { ...clone(src), id: newId });
      });
      return newId;
    },
    add: (slug: string, type: SectionType, afterId: string | null): string => {
      const cur = siteRef.current.pages[pageIndex(siteRef.current, slug)].sections;
      const s = newSection(type, cur.map((x) => x.id));
      commit((d) => {
        const arr = d.pages[pageIndex(d, slug)].sections;
        const i = afterId ? arr.findIndex((x) => x.id === afterId) : -1;
        // Default: insert before the footer if there is one.
        const footerIdx = arr.findIndex((x) => x.type === "footer");
        const at = i >= 0 ? i + 1 : footerIdx >= 0 ? footerIdx : arr.length;
        arr.splice(at, 0, clone(s));
      });
      return s.id;
    },
    setTone: (slug: string, id: string, tone: SectionTone) =>
      commit((d) => {
        const s = d.pages[pageIndex(d, slug)].sections.find((x) => x.id === id);
        if (!s) return;
        if (tone === "auto") delete s.tone;
        else s.tone = tone;
      }),
    setTheme: (theme: Theme) => commit((d) => void (d.theme = theme), true),
    setName: (name: string) => commit((d) => void (d.name = name), true),
    reset: (fresh: SiteData) => commit((d) => Object.assign(d, clone(fresh))),
    /** Apply an RFC 6902 patch (AI edit) as ONE undoable step. Throws if it doesn't apply or validate. */
    applyPatch: (patch: Operation[]) => {
      const next = applyPatch(siteRef.current, patch);
      const ok = safeParseSite(next);
      if (!ok.success) throw new Error("The AI change didn't validate, so it wasn't applied.");
      commit((d) => {
        for (const k of Object.keys(d) as (keyof SiteData)[]) delete d[k];
        Object.assign(d, next);
      });
    },
    /** Snapshot for sending to the API. */
    current: () => siteRef.current,
  };
  return api;
}
