"use client";
import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PropsOf } from "@/lib/schema";
import { Container } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const LG: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

function Counter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [inView, value]);
  const decimals = Number.isInteger(value) ? 0 : 1;
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export default function Stats({ props }: { props: PropsOf<"stats"> }) {
  const tinted = props.tinted;
  return (
    <section className={`py-16 sm:py-20 ${tinted ? "bg-primary text-primary-fg" : "bg-bg text-ink"}`}>
      <Container>
        {props.title && <h2 className="mb-12 text-center font-heading text-2xl font-bold sm:text-3xl">{props.title}</h2>}
        <Stagger className={`grid grid-cols-2 gap-y-10 ${LG[Math.min(props.items.length, 4)] ?? LG[4]}`}>
          {props.items.map((s, i) => (
            <StaggerItem key={i} className={`px-4 text-center ${i > 0 ? (tinted ? "lg:border-l lg:border-primary-fg/20" : "lg:border-l lg:border-line") : ""}`}>
              <div className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className={`mt-2 text-sm font-medium uppercase tracking-wider ${tinted ? "text-primary-fg/75" : "text-muted"}`}>{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
