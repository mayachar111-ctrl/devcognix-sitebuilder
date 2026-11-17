import type { IconName } from "@/lib/schema";

/** Hand-drawn 24×24 stroke icon set (original). */
const PATHS: Record<IconName | "arrow" | "play" | "plus" | "close" | "menu" | "quote" | "copy" | "instagram" | "x" | "linkedin" | "youtube" | "facebook" | "whatsapp" | "github", string> = {
  sparkles: "M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3zM9 12l2 2 4-4",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.5 8.2 12s1.3 6.5 3.8 9",
  heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.3 3.3 0 010 6.3M18 14.8c2 .7 3.2 2.5 3.5 5.2",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  leaf: "M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7",
  cup: "M4 8h13v5a6 6 0 01-6 6h-1a6 6 0 01-6-6V8zM17 10h1.5a2.5 2.5 0 010 5H17M8 2.5v2.5M12 2.5v2.5",
  phone: "M5 3h3.5l2 5-2.5 1.5a11 11 0 006 6L15.5 13l5 2V18.5A2.5 2.5 0 0118 21C10.3 20.5 3.5 13.7 3 6a2.5 2.5 0 012-3z",
  mail: "M3 6h18v12H3zM3 7l9 6.5L21 7",
  map: "M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  rocket: "M14 4c3-1.5 5.5-1.5 6-1 .5.5.5 3-1 6l-6 6-4-4 5-7zM9 11l-4 1-2 3 4 1M13 15l-1 4-3 2-1-4M15.5 8.5h.01",
  smile: "M12 3a9 9 0 100 18 9 9 0 000-18zM8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2M9 9.5h.01M15 9.5h.01",
  award: "M12 3a6 6 0 100 12 6 6 0 000-12zM8.5 14L7 21l5-2.5 5 2.5-1.5-7",
  camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z",
  wallet: "M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H3zM3 7l12-3v3M16.5 13.5h.01",
  chat: "M4 5h16v11H9l-5 4V5zM8 10h8M8 13h5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  copy: "M9 9h11v11H9zM5 15V4h11",
  play: "M8 5v14l11-7L8 5z",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  quote: "M9 7c-3 1-4.5 3.5-4.5 7v3h5v-5H7c0-2 .8-3.3 2.5-4M19 7c-3 1-4.5 3.5-4.5 7v3h5v-5H17c0-2 .8-3.3 2.5-4",
  instagram: "M4 4h16v16H4zM12 16a4 4 0 100-8 4 4 0 000 8zM17 7h.01",
  x: "M4 4l16 16M20 4L4 20",
  linkedin: "M4 4h16v16H4zM8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5a2.8 2.8 0 015.5 0V17",
  youtube: "M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3zM10 9v6l5-3z",
  facebook: "M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.6C17.5 2.5 16.4 2.4 15.2 2.4 12.6 2.4 10.6 4 10.6 7v2.5H7.5V13h3.1v8z",
  whatsapp: "M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-3.8-1zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2z",
  github: "M9 19c-4 1.3-4-2-5.5-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 00-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 00-.1 3.2A4.6 4.6 0 004.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
};

export type AnyIcon = keyof typeof PATHS;

export default function Icon({ name, className = "h-5 w-5", strokeWidth = 1.8 }: { name: AnyIcon; className?: string; strokeWidth?: number }) {
  const d = PATHS[name] ?? PATHS.sparkles;
  const filled = name === "play";
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
