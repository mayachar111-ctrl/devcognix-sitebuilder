"use client";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Process({ props }: { props: PropsOf<"process"> }) {
  return (
    <SectionShell id="process" tone="surface">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <div className="relative mx-auto max-w-3xl">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.4, ease }} className="absolute bottom-6 left-6 top-6 w-[2px] origin-top bg-gradient-to-b from-primary to-accent sm:left-1/2 sm:-translate-x-1/2" />
          <ol className="space-y-12">
            {props.steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <motion.li key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease, delay: 0.1 }} className="relative grid grid-cols-[3rem_1fr] gap-5 sm:grid-cols-2 sm:gap-14">
                  <span className="absolute left-6 top-0 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-4 border-surface bg-primary font-heading text-base font-bold text-primary-fg sm:left-1/2">{i + 1}</span>
                  <div className={right ? "col-start-2" : "col-start-2 sm:col-start-1 sm:text-right"}>
                    <div className="dc-card dc-card-hover p-6">
                      {s.meta && <p className="text-xs font-bold uppercase tracking-wider text-primary">{s.meta}</p>}
                      <h3 className="mt-1 text-xl font-semibold text-ink">{s.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{s.description}</p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </Container>
    </SectionShell>
  );
}
