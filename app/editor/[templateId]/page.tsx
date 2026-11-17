import { notFound } from "next/navigation";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import EditorShell from "@/components/editor/EditorShell";
import { AiEditorLoader } from "@/components/ai/AiSiteLoader";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ templateId: t.id }));
}

export const metadata = { title: "Editor · DevCognix Builder" };

export default function EditorPage({ params }: { params: { templateId: string } }) {
  // AI-generated sites live in the browser (Phase 2), so they load client-side.
  if (params.templateId.startsWith("ai-")) return <AiEditorLoader id={params.templateId} />;
  const t = getTemplate(params.templateId);
  if (!t) notFound();
  return <EditorShell templateId={t.id} templateName={t.name} initial={t.site} />;
}
