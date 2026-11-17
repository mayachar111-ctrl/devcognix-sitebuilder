"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Button, Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import Icon from "@/components/ui/Icon";

const GRID: Record<number, string> = { 1: "max-w-md", 2: "max-w-3xl md:grid-cols-2", 3: "max-w-5xl lg:grid-cols-3", 4: "max-w-6xl md:grid-cols-2 lg:grid-cols-4" };

export default function Pricing({ props }: { props: PropsOf<"pricing"> }) {
  const [yearly, setYearly] = useState(false);
  const fmt = (n: number) => n.toLocaleString(props.currency === "₹" ? "en-IN" : "en-US");
  return (
    <SectionShell id="pricing">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        {props.billingToggle && (
          <div className="-mt-6 mb-12 flex items-center justify-center gap-3 text-sm font-medium">
            <span className={yearly ? "text-muted" : "text-ink"}>Monthly</span>
            <button aria-label="Toggle yearly billing" onClick={() => setYearly((y) => !y)} className={`relative h-7 w-12 rounded-full transition-colors ${yearly ? "bg-primary" : "bg-line"}`}>
              <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${yearly ? "right-1" : "left-1"}`} />
            </button>
            <span className={yearly ? "text-ink" : "text-muted"}>Yearly</span>
            {props.yearlyNote && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">{props.yearlyNote}</span>}
          </div>
        )}
        <Stagger className={`mx-auto grid gap-6 ${GRID[props.plans.length] ?? GRID[3]}`}>
          {props.plans.map((p, i) => {
            const price = yearly ? p.priceYearly : p.priceMonthly;
            return (
              <StaggerItem key={i} className="h-full">
                <div className={`dc-card dc-card-hover relative flex h-full flex-col p-8 ${p.highlighted ? "!border-primary ring-4 ring-primary/15 lg:-translate-y-3" : ""}`}>
                  {p.highlighted && <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-fg">Most popular</span>}
                  <h3 className="text-lg font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.description}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="font-heading text-5xl font-bold tracking-tight text-ink">
                      {props.currency}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={price} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="inline-block">
                          {fmt(price)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="mb-1.5 text-muted">{p.period}</span>
                  </div>
                  <ul className="mt-7 flex-1 space-y-3">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 text-[15px] text-ink">
                        <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2.4} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button link={p.cta} variant={p.highlighted ? "primary" : "ghost"} className="mt-8 w-full" />
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
