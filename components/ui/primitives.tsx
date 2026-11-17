import type { ReactNode } from "react";
import type { Link } from "@/lib/schema";
import { Reveal } from "./motion";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionShell({ id, children, className = "", tone = "bg" }: { id?: string; children: ReactNode; className?: string; tone?: "bg" | "surface" }) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 ${tone === "surface" ? "bg-surface" : "bg-bg"} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title?: string; subtitle?: string; align?: "center" | "left" }) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <Reveal className={`mb-12 sm:mb-16 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow ? <p className="dc-eyebrow mb-3">{eyebrow}</p> : null}
      {title ? <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.6rem]">{title}</h2> : null}
      {subtitle ? <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p> : null}
    </Reveal>
  );
}

export function Button({ link, variant = "primary", className = "" }: { link?: Link; variant?: "primary" | "ghost" | "light"; className?: string }) {
  if (!link || !link.label) return null;
  const base = "dc-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]";
  const styles = {
    primary: "dc-btn-primary bg-primary text-primary-fg hover:-translate-y-0.5 hover:brightness-110",
    ghost: "dc-btn-ghost border border-line bg-transparent text-ink hover:-translate-y-0.5 hover:border-ink/40",
    light: "bg-white text-neutral-900 hover:-translate-y-0.5 hover:bg-white/90",
  }[variant];
  return (
    <a href={link.href || "#"} className={`${base} ${styles} ${className}`}>
      {link.label}
    </a>
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
