"use client";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell, initials } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

export default function Testimonials({ props }: { props: PropsOf<"testimonials"> }) {
  return (
    <SectionShell tone="surface" id="testimonials">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <Stagger className={`mx-auto grid items-start gap-5 ${props.items.length === 1 ? "max-w-xl" : props.items.length === 2 || props.items.length === 4 ? "max-w-4xl sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`} step={0.1}>
          {props.items.map((t, i) => (
            <StaggerItem key={i}>
              <figure className="dc-card dc-card-hover relative p-7">
                <Icon name="quote" className="absolute right-6 top-6 h-8 w-8 text-primary/20" />
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} viewBox="0 0 20 20" className={`h-4 w-4 ${s < Math.round(t.rating) ? "fill-current" : "fill-line"}`}><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z" /></svg>
                  ))}
                </div>
                <blockquote className="text-[17px] leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.avatar ? (
                    <SmartImage src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">{initials(t.name)}</span>
                  )}
                  <span>
                    <span className="block font-semibold text-ink">{t.name}</span>
                    <span className="block text-sm text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
