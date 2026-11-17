"use client";
import { Component, type ReactNode, type MouseEvent } from "react";
import type { SectionData, SiteData } from "@/lib/schema";
import { withDefaults, SECTION_LIBRARY } from "@/lib/defaults";
import { themeToCssVars, toneVars } from "@/lib/theme";
import type { Theme } from "@/lib/schema";
import { SECTION_COMPONENTS } from "./registry";

class SectionBoundary extends Component<{ children: ReactNode; label: string }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  render() {
    if (this.state.error)
      return (
        <div className="border-y border-red-300 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
          Section “{this.props.label}” could not render: {this.state.error}
        </div>
      );
    return this.props.children;
  }
}

export function SectionView({ section, theme }: { section: SectionData; theme?: Theme }) {
  const C = SECTION_COMPONENTS[section.type];
  if (!C) return <div className="p-6 text-center text-sm text-red-600">Unknown section type “{section.type}”</div>;
  const props = withDefaults(section.type, section.props as never);
  const tv = theme ? toneVars(theme, section.tone) : undefined;
  const body = (
    <SectionBoundary label={section.type}>
      <C props={props} />
    </SectionBoundary>
  );
  if (!tv) return body;
  // Navbars use `display: contents` so `position: sticky` still works; other sections get a painted band.
  const style = section.type === "navbar"
    ? { ...tv, display: "contents", color: "rgb(var(--c-text))" }
    : { ...tv, background: "rgb(var(--c-bg))", color: "rgb(var(--c-text))" };
  return <div className="dc-tone" data-tone={section.tone} style={style}>{body}</div>;
}

type Props = {
  site: SiteData;
  pageSlug?: string;
  /** Editor mode: sections become selectable and links stop navigating. */
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const labelOf = (t: string) => SECTION_LIBRARY.find((s) => s.type === t)?.label ?? t;

export default function SiteRenderer({ site, pageSlug, editable, selectedId, onSelect }: Props) {
  const page = site.pages.find((p) => p.slug === pageSlug) ?? site.pages[0];
  return (
    <div className="dc-site min-h-full" style={themeToCssVars(site.theme)} data-style={site.theme.style} data-radius={site.theme.radius}>
      {page.sections.map((s) =>
        editable ? (
          <div
            key={s.id}
            data-section-id={s.id}
            id={s.id}
            onClickCapture={(e: MouseEvent) => {
              const el = e.target as HTMLElement;
              if (el.closest("a, button[type=submit], form")) e.preventDefault();
              onSelect?.(s.id);
            }}
            className={`group/sel relative cursor-pointer ${s.type === "navbar" && (s.props as { sticky?: boolean }).sticky !== false ? "sticky top-0 z-40" : ""}`}
          >
            <SectionView section={s} theme={site.theme} />
            <div
              className={`pointer-events-none absolute inset-0 z-[45] transition-all ${
                selectedId === s.id ? "outline outline-[3px] -outline-offset-[3px] outline-[#2563eb]" : "outline-dashed outline-2 -outline-offset-2 outline-transparent group-hover/sel:outline-[#2563eb]/60"
              }`}
            >
              <span className={`absolute left-2 top-2 rounded-md bg-[#2563eb] px-2 py-1 font-sans text-[11px] font-semibold text-white shadow ${selectedId === s.id ? "opacity-100" : "opacity-0 group-hover/sel:opacity-100"}`}>
                {labelOf(s.type)}
              </span>
            </div>
          </div>
        ) : (
          s.type === "navbar" ? (
            <SectionView key={s.id} section={s} theme={site.theme} />
          ) : (
            // Block wrapper so "#<section-id>" links have a real scroll target.
            <div key={s.id} id={s.id}>
              <SectionView section={s} theme={site.theme} />
            </div>
          )
        ),
      )}
    </div>
  );
}
