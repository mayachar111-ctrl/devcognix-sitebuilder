"use client";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import SmartImage from "@/components/ui/SmartImage";

export default function Team({ props }: { props: PropsOf<"team"> }) {
  return (
    <SectionShell id="team">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <Stagger className={`mx-auto grid grid-cols-2 gap-5 ${props.members.length <= 2 ? "max-w-2xl" : props.members.length === 3 ? "max-w-4xl lg:grid-cols-3" : "lg:grid-cols-4"}`} step={0.1}>
          {props.members.map((m, i) => (
            <StaggerItem key={i}>
              <div className="group">
                <div className="relative overflow-hidden rounded-theme-lg">
                  <SmartImage src={m.photo} alt={m.name} className="aspect-[4/5] w-full object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-sm leading-snug text-white transition-transform duration-500 group-hover:translate-y-0">{m.bio}</div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{m.name}</h3>
                <p className="text-sm text-primary">{m.role}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
