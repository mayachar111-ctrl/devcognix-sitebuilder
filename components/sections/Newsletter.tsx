"use client";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import Icon from "@/components/ui/Icon";

export default function Newsletter({ props }: { props: PropsOf<"newsletter"> }) {
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setDone(true); };
  return (
    <section id="newsletter" className="bg-surface py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-theme bg-primary text-primary-fg"><Icon name="mail" className="h-6 w-6" /></span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">{props.title}</h2>
          <p className="mt-4 text-lg text-muted">{props.subtitle}</p>
          {done ? (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 font-semibold text-primary">You&apos;re in — check your inbox.</motion.p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="email" required placeholder={props.placeholder} className="dc-input flex-1" />
              <button className="dc-btn dc-btn-primary bg-primary px-6 py-3 font-semibold text-primary-fg transition hover:brightness-110">{props.buttonLabel}</button>
            </form>
          )}
          {props.note && <p className="mt-4 text-sm text-muted">{props.note}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
