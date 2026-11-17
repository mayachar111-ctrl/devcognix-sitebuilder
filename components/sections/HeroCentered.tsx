"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { PropsOf } from "@/lib/schema";
import { Button, Container } from "@/components/ui/primitives";
import SmartImage from "@/components/ui/SmartImage";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroCentered({ props }: { props: PropsOf<"hero-centered"> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 0.5], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  return (
    <section className="relative overflow-hidden bg-bg pb-16 pt-20 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 dc-grid-bg [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <Container className="relative text-center">
        {props.eyebrow && (
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-4 py-1.5 text-sm font-medium text-muted backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {props.eyebrow}
          </motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.08 }} className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
          {props.headline}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.16 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {props.subheadline}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.24 }} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button link={props.primaryCta} />
          <Button link={props.secondaryCta} variant="ghost" />
        </motion.div>
      </Container>
      {props.image?.src ? (
        <div ref={ref} className="relative mx-auto mt-16 max-w-6xl px-5 sm:px-8 [perspective:1400px]">
          <motion.div style={{ rotateX: rotate, scale }} className="dc-card overflow-hidden p-2">
            <SmartImage src={props.image.src} alt={props.image.alt} loading="eager" className="aspect-[16/9] w-full rounded-theme object-cover" />
          </motion.div>
        </div>
      ) : null}
    </section>
  );
}
