"use client";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import Icon from "@/components/ui/Icon";

const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

export default function FeaturesGrid({ props }: { props: PropsOf<"features-grid"> }) {
  return (
    <SectionShell id="features">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <Stagger className={`grid gap-5 ${cols[props.columns] ?? cols[3]}`}>
          {props.items.map((f, i) => (
            <StaggerItem key={i} className="h-full">
              <div className="dc-card dc-card-hover group h-full p-7">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-theme bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-fg">
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
