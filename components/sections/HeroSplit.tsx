"use client";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Button, Container } from "@/components/ui/primitives";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSplit({ props }: { props: PropsOf<"hero-split"> }) {
  const left = props.imageSide === "left";
  return (
    <section className="relative overflow-hidden bg-bg py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div initial={{ opacity: 0, x: left ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease }} className={left ? "lg:order-2" : ""}>
          {props.eyebrow && <p className="dc-eyebrow mb-4">{props.eyebrow}</p>}
          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">{props.headline}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{props.subheadline}</p>
          {props.bullets.length > 0 && (
            <ul className="mt-7 space-y-3">
              {props.bullets.map((b, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} className="flex items-center gap-3 text-[15px] font-medium text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /></span>
                  {b}
                </motion.li>
              ))}
            </ul>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            <Button link={props.primaryCta} />
            <Button link={props.secondaryCta} variant="ghost" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease, delay: 0.1 }} className={`relative ${left ? "lg:order-1" : ""}`}>
          <div className="absolute -inset-3 rotate-2 rounded-theme-lg bg-gradient-to-br from-primary/25 to-accent/25" />
          <SmartImage src={props.image.src} alt={props.image.alt} loading="eager" className="relative aspect-[5/6] w-full rounded-theme-lg object-cover shadow-2xl sm:aspect-[4/4.4]" />
          {props.badge && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: [0, -6, 0] }} transition={{ opacity: { delay: 0.6 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} className={`dc-card absolute bottom-6 ${left ? "-right-2 sm:-right-6" : "-left-2 sm:-left-6"} flex items-center gap-3 px-4 py-3`}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-fg"><Icon name="star" className="h-4 w-4" /></span>
              <span className="max-w-[12rem] text-sm font-semibold leading-snug text-ink">{props.badge}</span>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
