"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

export default function Video({ props }: { props: PropsOf<"video"> }) {
  const [playing, setPlaying] = useState(false);
  const src = props.embedUrl + (props.embedUrl.includes("?") ? "&" : "?") + "autoplay=1";
  return (
    <SectionShell id="video" tone="surface">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <Reveal>
          <div className="dc-card relative mx-auto aspect-video max-w-5xl overflow-hidden !p-0">
            {playing ? (
              <iframe src={src} title={props.title || "Video"} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <button onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label="Play video">
                <SmartImage src={props.poster.src} alt={props.poster.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.span animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 rounded-full bg-white" />
                  <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white text-neutral-900 shadow-2xl transition-transform group-hover:scale-110">
                    <Icon name="play" className="ml-1 h-8 w-8" />
                  </span>
                </span>
              </button>
            )}
          </div>
          {props.caption && <p className="mt-4 text-center text-sm text-muted">{props.caption}</p>}
        </Reveal>
      </Container>
    </SectionShell>
  );
}
