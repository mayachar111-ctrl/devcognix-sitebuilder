"use client";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Button, Container } from "@/components/ui/primitives";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroGradient({ props }: { props: PropsOf<"hero-gradient"> }) {
  const words = props.headline.split(" ");
  return (
    <section className="relative isolate overflow-hidden bg-bg py-28 sm:py-40">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-[10%] top-[-20%] h-[60vmax] w-[60vmax] animate-drift rounded-full bg-primary/35 blur-[110px]" />
        <div className="absolute -right-[15%] top-[10%] h-[50vmax] w-[50vmax] animate-drift-slow rounded-full bg-accent/30 blur-[110px]" />
        <div className="absolute inset-0 dc-grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />
      </div>
      <Container className="text-center">
        {props.badge && (
          <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="dc-card inline-flex items-center gap-2 !rounded-full px-4 py-1.5 text-sm font-medium text-ink">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            {props.badge}
          </motion.span>
        )}
        <h1 className="mx-auto mt-7 max-w-5xl font-heading text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-7xl lg:text-[5.4rem]">
          {words.map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease, delay: i * 0.06 }} className="inline-block pr-[0.25em]">
              {w}
            </motion.span>
          ))}
          {props.highlight && (
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: words.length * 0.06 }} className="dc-gradient-text inline-block">
              {props.highlight}
            </motion.span>
          )}
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {props.subheadline}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.55 }} className="mt-10 flex flex-wrap justify-center gap-3">
          <Button link={props.primaryCta} />
          <Button link={props.secondaryCta} variant="ghost" />
        </motion.div>
        {props.note && <p className="mt-5 text-sm text-muted">{props.note}</p>}
      </Container>
    </section>
  );
}
