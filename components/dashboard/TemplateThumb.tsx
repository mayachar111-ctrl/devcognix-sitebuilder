"use client";
import { useEffect, useRef, useState } from "react";

/** Live, scaled-down render of a template inside an iframe. */
export default function TemplateThumb({ id, title }: { id: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  // The iframe can finish loading before hydration attaches onLoad, so also check directly.
  useEffect(() => {
    const done = () => setLoaded(true);
    if (frame.current?.contentDocument?.readyState === "complete") done();
    const t = setTimeout(done, 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1440));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-100">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-100 to-neutral-200" />}
      <iframe
        src={`/preview/${id}?thumb=1`}
        title={`${title} preview`}
        ref={frame}
        tabIndex={-1}
        onLoad={() => setLoaded(true)}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: 1440, height: 990, transform: `scale(${scale})` }}
      />
    </div>
  );
}
