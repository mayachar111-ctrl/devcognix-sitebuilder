"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteGenerated, listGenerated, type GeneratedMeta } from "@/lib/localSites";

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

/** Sites generated on this device (localStorage until Phase 3 adds accounts). */
export default function MySites() {
  const [sites, setSites] = useState<GeneratedMeta[] | null>(null);
  useEffect(() => setSites(listGenerated()), []);
  if (!sites?.length) return null;
  return (
    <section id="my-sites" className="mb-14">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your AI sites</h2>
          <p className="text-sm text-black/50">Saved in this browser · {sites.length} site{sites.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => (
          <article key={s.id} className="group flex items-start gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold" style={{ background: s.primary, color: s.background }}>
              {s.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{s.name}</h3>
              <p className="line-clamp-2 text-xs text-black/50">“{s.prompt}”</p>
              <p className="mt-1 text-[11px] text-black/35">{ago(s.createdAt)}</p>
              <div className="mt-2 flex gap-2 text-xs font-semibold">
                <Link href={`/editor/${s.id}`} className="rounded-lg bg-[#111118] px-3 py-1.5 text-white">Open editor</Link>
                <Link href={`/preview/${s.id}?local=1`} target="_blank" className="rounded-lg border border-black/10 px-3 py-1.5">Preview</Link>
                <button
                  onClick={() => {
                    if (!confirm(`Delete “${s.name}” from this browser?`)) return;
                    deleteGenerated(s.id);
                    setSites(listGenerated());
                  }}
                  className="ml-auto rounded-lg px-2 py-1.5 text-black/35 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
