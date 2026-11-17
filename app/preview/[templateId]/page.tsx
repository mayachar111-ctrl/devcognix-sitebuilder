import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { Suspense } from "react";
import SiteRenderer from "@/components/renderer/SiteRenderer";
import { AiPreview } from "@/components/ai/AiSiteLoader";
import PreviewClient from "./PreviewClient";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ templateId: t.id }));
}

export function generateMetadata({ params }: { params: { templateId: string } }): Metadata {
  if (params.templateId.startsWith("ai-")) return { title: "Preview · DevCognix" };
  const t = getTemplate(params.templateId);
  return { title: t ? t.site.pages[0].title : "Not found", description: t?.site.description };
}

export default function PreviewPage({ params }: { params: { templateId: string } }) {
  if (params.templateId.startsWith("ai-"))
    return (
      <Suspense fallback={null}>
        <AiPreview id={params.templateId} />
      </Suspense>
    );
  const t = getTemplate(params.templateId);
  if (!t) notFound();
  return (
    <Suspense fallback={<SiteRenderer site={t.site} />}>
      <PreviewClient templateId={t.id} site={t.site} />
    </Suspense>
  );
}
