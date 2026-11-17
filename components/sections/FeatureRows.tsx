"use client";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

const ease = [0.22, 1, 0.36, 1] as const;

export default function FeatureRows({ props }: { props: PropsOf<"feature-rows"> }) {
  return (
    <SectionShell tone="surface">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <div className="space-y-20 sm:space-y-28">
          {props.rows.map((r, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={i} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <motion.div initial={{ opacity: 0, x: flip ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease }} className={flip ? "lg:order-2" : ""}>
                  <div className="group overflow-hidden rounded-theme-lg">
                    <SmartImage src={r.image.src} alt={r.image.alt} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease, delay: 0.1 }} className={flip ? "lg:order-1" : ""}>
                  <span className="font-heading text-sm font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">{r.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{r.description}</p>
                  {r.bullets.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {r.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3 text-ink">
                          <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2.4} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}
