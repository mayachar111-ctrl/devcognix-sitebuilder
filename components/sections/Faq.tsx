"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import Icon from "@/components/ui/Icon";

export default function Faq({ props }: { props: PropsOf<"faq"> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SectionShell id="faq" tone="surface">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} align="left" />
        <Reveal className="divide-y divide-line border-y border-line">
          {props.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={isOpen}>
                  <span className="text-lg font-semibold text-ink">{f.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${isOpen ? "border-primary bg-primary text-primary-fg" : "border-line text-ink"}`}>
                    <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="max-w-2xl pb-6 leading-relaxed text-muted">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </SectionShell>
  );
}
