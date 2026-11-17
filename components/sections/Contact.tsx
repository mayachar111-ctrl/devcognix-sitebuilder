"use client";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import Icon, { type AnyIcon } from "@/components/ui/Icon";

export default function Contact({ props }: { props: PropsOf<"contact"> }) {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true); // Phase 1: no backend. Phase 3 wires this to a form-submissions API.
  };
  const details: { icon: AnyIcon; label: string; value: string; href?: string }[] = [
    { icon: "mail", label: "Email", value: props.email, href: `mailto:${props.email}` },
    { icon: "phone", label: "Phone", value: props.phone, href: `tel:${props.phone.replace(/\s/g, "")}` },
    { icon: "map", label: "Visit", value: props.address },
    { icon: "clock", label: "Hours", value: props.hours },
  ];
  const details2 = details.filter((d) => d.value);
  return (
    <SectionShell id="contact">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} align="left" />
          <Reveal className="space-y-5">
            {details2.map((d) => (
              <div key={d.label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-theme bg-primary/10 text-primary"><Icon name={d.icon} /></span>
                <div>
                  <p className="text-sm text-muted">{d.label}</p>
                  {d.href ? <a href={d.href} className="font-medium text-ink hover:text-primary">{d.value}</a> : <p className="font-medium text-ink">{d.value}</p>}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="dc-card relative overflow-hidden p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[22rem] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-fg"><Icon name="check" className="h-8 w-8" strokeWidth={2.6} /></span>
                  <p className="mt-5 text-xl font-semibold text-ink">{props.successMessage}</p>
                  <button onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-primary">Send another</button>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Name</span><input required className="dc-input" placeholder="Your name" /></label>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink">Phone or email</span><input required className="dc-input" placeholder="How we reach you" /></label>
                  {props.showServiceField && (
                    <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-ink">What do you need?</span>
                      <select className="dc-input">{props.services.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>
                  )}
                  <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-ink">Message</span><textarea rows={5} className="dc-input resize-none" placeholder="Tell us a little more…" /></label>
                  <button type="submit" className="dc-btn dc-btn-primary mt-2 inline-flex items-center justify-center gap-2 bg-primary px-6 py-3.5 font-semibold text-primary-fg transition hover:brightness-110 sm:col-span-2">
                    {props.submitLabel} <Icon name="arrow" className="h-4 w-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
