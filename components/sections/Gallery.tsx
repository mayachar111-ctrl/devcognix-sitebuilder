"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

export default function Gallery({ props }: { props: PropsOf<"gallery"> }) {
  const [active, setActive] = useState<number | null>(null);
  const masonry = props.layout === "masonry";
  const tile = (img: { src: string; alt: string }, i: number) => (
    <button onClick={() => setActive(i)} className="group relative block w-full overflow-hidden rounded-theme">
      <SmartImage src={img.src} alt={img.alt} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${masonry ? "" : "aspect-square"}`} />
      <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">{img.alt}</span>
    </button>
  );
  return (
    <SectionShell id="gallery">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        {masonry ? (
          <>
            {/* Flex-column masonry (round-robin) — avoids CSS multi-column paint bugs with animated children. */}
            {[2, 3].map((n) => (
              <div key={n} className={`${n === 2 ? "flex md:hidden" : "hidden md:flex"} gap-4`}>
                {Array.from({ length: n }).map((_, c) => (
                  <Stagger key={c} className="flex flex-1 flex-col gap-4" step={0.08}>
                    {props.images.map((img, i) => (i % n === c ? <StaggerItem key={i}>{tile(img, i)}</StaggerItem> : null))}
                  </Stagger>
                ))}
              </div>
            ))}
          </>
        ) : (
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3" step={0.06}>
            {props.images.map((img, i) => (
              <StaggerItem key={i}>{tile(img, i)}</StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
      <AnimatePresence>
        {active !== null && props.images[active] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6 backdrop-blur-sm">
            <button aria-label="Close" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><Icon name="close" /></button>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <SmartImage src={props.images[active].src} alt={props.images[active].alt} className="max-h-[85vh] w-auto rounded-theme object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
