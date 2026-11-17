"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditorShell from "@/components/editor/EditorShell";
import SiteRenderer from "@/components/renderer/SiteRenderer";
import { listGenerated, loadGenerated } from "@/lib/localSites";
import { storageKey } from "@/components/editor/useSiteStore";
import { safeParseSite, type SiteData } from "@/lib/schema";

function useAiSite(id: string, preferWorking: boolean) {
  const [state, setState] = useState<{ site: SiteData | null; original: SiteData | null; ready: boolean }>({ site: null, original: null, ready: false });
  useEffect(() => {
    const original = loadGenerated(id);
    let site = original;
    if (preferWorking) {
      try {
        const raw = localStorage.getItem(storageKey(id));
        const parsed = raw ? safeParseSite(JSON.parse(raw)) : null;
        if (parsed?.success) site = parsed.data as unknown as SiteData;
      } catch {}
    }
    setState({ site, original, ready: true });
  }, [id, preferWorking]);
  return state;
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-neutral-50 p-6 text-center">
      <div>
        <p className="text-lg font-semibold">This site isn't saved in this browser</p>
        <p className="mt-1 text-sm text-neutral-500">AI sites are kept in local storage until accounts arrive in Phase 3.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">Back to dashboard</Link>
      </div>
    </div>
  );
}

export function AiEditorLoader({ id }: { id: string }) {
  const { original, ready } = useAiSite(id, false);
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-neutral-400">Loading your site…</div>;
  if (!original) return <NotFound />;
  const meta = listGenerated().find((m) => m.id === id);
  // EditorShell hydrates the working copy itself; `original` is what Reset restores.
  return <EditorShell templateId={id} templateName="AI" initial={original} subtitle={`AI generated${meta?.model ? ` · ${meta.model}` : ""}`} />;
}

export function AiPreview({ id }: { id: string }) {
  const page = useSearchParams().get("page") ?? undefined;
  const { site, ready } = useAiSite(id, true);
  if (!ready) return null;
  if (!site) return <NotFound />;
  return <SiteRenderer site={site} pageSlug={page} />;
}
