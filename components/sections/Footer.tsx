"use client";
import type { PropsOf } from "@/lib/schema";
import { Container } from "@/components/ui/primitives";
import Icon from "@/components/ui/Icon";

export default function Footer({ props }: { props: PropsOf<"footer"> }) {
  return (
    <footer className="border-t border-line bg-bg pt-16">
      <Container>
        <div className="grid gap-10 pb-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#" className="flex items-center gap-2.5 font-heading text-lg font-bold text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-theme-sm bg-gradient-to-br from-primary to-accent text-sm font-black text-primary-fg">{props.brand.trim().charAt(0).toUpperCase() || "•"}</span>
              {props.brand}
            </a>
            <p className="mt-4 max-w-xs leading-relaxed text-muted">{props.tagline}</p>
            <div className="mt-6 flex gap-2">
              {props.socials.map((s, i) => (
                <a key={i} href={s.href} aria-label={s.platform} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                  <Icon name={s.platform} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
          {props.columns.map((c, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ink">{c.title}</h4>
              <ul className="mt-4 space-y-3">
                {c.links.map((l, j) => (
                  <li key={j}><a href={l.href} className="text-muted transition-colors hover:text-primary">{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-6 text-sm text-muted sm:flex-row">
          <p>{props.copyright}</p>
          <p>Built with DevCognix</p>
        </div>
      </Container>
    </footer>
  );
}
