"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Button, Container } from "@/components/ui/primitives";
import Icon from "@/components/ui/Icon";

export default function Navbar({ props }: { props: PropsOf<"navbar"> }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`${props.sticky ? "sticky top-0" : "relative"} z-40 border-b transition-colors duration-300 ${scrolled ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent bg-bg/60 backdrop-blur"}`}>
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-theme-sm bg-gradient-to-br from-primary to-accent text-sm font-black text-primary-fg">
            {props.brand.trim().charAt(0).toUpperCase() || "•"}
          </span>
          {props.brand}
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {props.links.map((l, i) => (
            <a key={i} href={l.href} className="group relative text-[15px] font-medium text-muted transition-colors hover:text-ink">
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button link={props.cta} className="!px-5 !py-2.5 text-sm" />
        </div>
        <button aria-label="Menu" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-theme-sm border border-line text-ink md:hidden">
          <Icon name={open ? "close" : "menu"} />
        </button>
      </Container>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line bg-bg md:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {props.links.map((l, i) => (
                <a key={i} href={l.href} onClick={() => setOpen(false)} className="rounded-theme-sm px-2 py-3 text-base font-medium text-ink hover:bg-surface">
                  {l.label}
                </a>
              ))}
              <Button link={props.cta} className="mt-2" />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
