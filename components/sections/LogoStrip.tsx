"use client";
import type { PropsOf } from "@/lib/schema";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

const fonts = ["font-heading font-black tracking-tight", "font-body font-semibold italic", "font-heading font-bold uppercase tracking-[0.2em] text-[0.8em]", "font-body font-extrabold", "font-heading font-medium tracking-wide"];

export default function LogoStrip({ props }: { props: PropsOf<"logo-strip"> }) {
  const Logo = ({ name, i }: { name: string; i: number }) => (
    <span className={`whitespace-nowrap text-xl text-ink/45 transition-colors duration-300 hover:text-ink sm:text-2xl ${fonts[i % fonts.length]}`}>{name}</span>
  );
  return (
    <section className="border-y border-line bg-bg py-12">
      <Container>
        {props.title && <p className="mb-8 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted">{props.title}</p>}
        {props.marquee ? (
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-16">
              {[...props.logos, ...props.logos].map((l, i) => <Logo key={i} name={l} i={i % props.logos.length} />)}
            </div>
          </div>
        ) : (
          <Reveal className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {props.logos.map((l, i) => <Logo key={i} name={l} i={i} />)}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
