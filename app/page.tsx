import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { SECTION_LIBRARY } from "@/lib/defaults";
import TemplateThumb from "@/components/dashboard/TemplateThumb";
import PromptStudio from "@/components/dashboard/PromptStudio";
import MySites from "@/components/dashboard/MySites";
import { CreditsPill } from "@/components/ai/useCredits";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#111118]">
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#111118] text-sm font-black text-white">D</span>
            <span className="font-semibold tracking-tight">DevCognix <span className="text-black/40">Builder</span></span>
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">Phase 2 · AI</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-black/60">
            <a href="#templates" className="font-medium text-black">Templates</a>
            <a href="#my-sites" className="hover:text-black">My sites</a>
            <CreditsPill />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        <section className="py-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">What are we building today?</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-black/55">Describe your business and DevCognix drafts the whole site: copy, layout, colours and photos. Then refine it by chatting.</p>
          <PromptStudio />
        </section>

        <MySites />

        <div id="templates" className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Or start from a template</h2>
            <p className="text-sm text-black/50">{TEMPLATES.length} templates · {SECTION_LIBRARY.length} section types</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {TEMPLATES.map((t) => {
            const p = t.site.theme.palette;
            return (
              <article key={t.id} className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative border-b border-black/[0.06]">
                  <TemplateThumb id={t.id} title={t.name} />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                    <Link href={`/preview/${t.id}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow">Preview</Link>
                    <Link href={`/editor/${t.id}`} className="rounded-full bg-[#111118] px-5 py-2.5 text-sm font-semibold text-white shadow">Customise</Link>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{t.category}</p>
                    <h3 className="mt-1 text-lg font-semibold">{t.name}</h3>
                    <p className="mt-1 text-sm text-black/55">{t.blurb}</p>
                  </div>
                  <div className="flex shrink-0 -space-x-1.5 pt-1">
                    {[p.primary, p.accent, p.background, p.text].map((c, i) => (
                      <span key={i} className="h-5 w-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 px-5 pb-5">
                  <Link href={`/editor/${t.id}`} className="flex-1 rounded-xl bg-[#111118] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-black">Customise</Link>
                  <Link href={`/preview/${t.id}`} className="flex-1 rounded-xl border border-black/10 py-2.5 text-center text-sm font-semibold transition hover:bg-black/[0.03]">Preview</Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
