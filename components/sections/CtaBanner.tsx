"use client";
import type { PropsOf } from "@/lib/schema";
import { Button, Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

export default function CtaBanner({ props }: { props: PropsOf<"cta-banner"> }) {
  const v = props.variant;
  const box =
    v === "gradient"
      ? "bg-gradient-to-br from-primary via-primary to-accent text-primary-fg"
      : v === "solid"
        ? "bg-ink text-bg"
        : "dc-card text-ink";
  const blobs = v === "gradient";
  const secondaryCls =
    v === "gradient" ? "border border-white/40 hover:bg-white/10" : v === "solid" ? "border border-bg/30 hover:bg-bg/10" : "border border-line hover:border-ink/40";
  return (
    <section className="bg-bg py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className={`relative overflow-hidden rounded-theme-lg px-8 py-16 text-center sm:px-16 sm:py-20 ${box}`}>
            {blobs && (
              <>
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-drift rounded-full bg-white/15 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 animate-drift-slow rounded-full bg-white/10 blur-2xl" />
              </>
            )}
            <h2 className="relative mx-auto max-w-3xl font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{props.title}</h2>
            {props.subtitle && <p className={`relative mx-auto mt-5 max-w-xl text-lg ${v === "outline" ? "text-muted" : "opacity-80"}`}>{props.subtitle}</p>}
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Button link={props.primaryCta} variant={v === "gradient" ? "light" : "primary"} />
              {props.secondaryCta?.label ? (
                <a href={props.secondaryCta.href} className={`dc-btn inline-flex items-center px-6 py-3 text-[15px] font-semibold transition hover:-translate-y-0.5 ${secondaryCls}`}>
                  {props.secondaryCta.label}
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
