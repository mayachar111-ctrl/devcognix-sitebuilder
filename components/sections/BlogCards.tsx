"use client";
import type { PropsOf } from "@/lib/schema";
import { Container, SectionHeader, SectionShell } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import SmartImage from "@/components/ui/SmartImage";
import Icon from "@/components/ui/Icon";

export default function BlogCards({ props }: { props: PropsOf<"blog-cards"> }) {
  return (
    <SectionShell id="blog">
      <Container>
        <SectionHeader eyebrow={props.eyebrow} title={props.title} subtitle={props.subtitle} />
        <Stagger className={`mx-auto grid gap-6 md:grid-cols-2 ${props.posts.length === 2 || props.posts.length === 4 ? "max-w-4xl" : "lg:grid-cols-3"}`} step={0.1}>
          {props.posts.map((p, i) => (
            <StaggerItem key={i} className="h-full">
              <a href={p.href} className="dc-card dc-card-hover group flex h-full flex-col overflow-hidden">
                <div className="overflow-hidden">
                  <SmartImage src={p.image.src} alt={p.image.alt} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-primary">{p.category}</span>
                    <span className="h-1 w-1 rounded-full bg-muted/50" />
                    <span className="text-muted">{p.date}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-ink">{p.title}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted">{p.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    Read more <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
