"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteRenderer from "@/components/renderer/SiteRenderer";
import { safeParseSite, type SiteData } from "@/lib/schema";
import { storageKey } from "@/components/editor/useSiteStore";

/** ?page=<slug> picks a page; ?local=1 shows the copy saved by the editor. */
export default function PreviewClient({ templateId, site }: { templateId: string; site: SiteData }) {
  const params = useSearchParams();
  const [data, setData] = useState(site);
  const [page, setPage] = useState<string | undefined>(params.get("page") ?? undefined);

  useEffect(() => {
    if (params.get("local") !== "1") return;
    try {
      const raw = localStorage.getItem(storageKey(templateId));
      if (!raw) return;
      const parsed = safeParseSite(JSON.parse(raw));
      if (parsed.success) setData(parsed.data as unknown as SiteData);
    } catch {}
  }, [params, templateId]);

  // Multi-page support: intercept "/<slug>" links that match a page of this site.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const slug = href === "/" ? "home" : href.slice(1);
      if (data.pages.some((p) => p.slug === slug)) {
        e.preventDefault();
        setPage(slug);
        window.scrollTo({ top: 0 });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [data]);

  return <SiteRenderer site={data} pageSlug={page} />;
}
