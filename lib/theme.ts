import type { CSSProperties } from "react";
import type { Theme } from "./schema";

export const FONT_STACKS: Record<Theme["fontPair"], { heading: string; body: string; label: string }> = {
  modern: { heading: "'Inter'", body: "'Inter'", label: "Modern · Inter" },
  editorial: { heading: "'Fraunces'", body: "'Inter'", label: "Editorial · Fraunces / Inter" },
  geometric: { heading: "'Space Grotesk'", body: "'DM Sans'", label: "Geometric · Space Grotesk / DM Sans" },
  friendly: { heading: "'Poppins'", body: "'Nunito'", label: "Friendly · Poppins / Nunito" },
  classic: { heading: "'Playfair Display'", body: "'Source Sans 3'", label: "Classic · Playfair / Source Sans" },
  "mono-tech": { heading: "'JetBrains Mono'", body: "'Inter'", label: "Tech · JetBrains Mono / Inter" },
};

/** One stylesheet with every family the theme system can pick. */
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@500;700&family=Poppins:wght@500;600;700&family=Source+Sans+3:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap";

const RADIUS_PX: Record<Theme["radius"], string> = { none: "0px", sm: "6px", md: "10px", lg: "16px", xl: "24px" };

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const triplet = (hex: string) => hexToRgb(hex).join(" ");

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Pick black or white text for a given fill. */
export const readableOn = (hex: string) => (contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#0b0b0f") ? "#ffffff" : "#0b0b0f");

export function themeToCssVars(theme: Theme): CSSProperties {
  const p = theme.palette;
  const fonts = FONT_STACKS[theme.fontPair] ?? FONT_STACKS.modern;
  return {
    "--c-primary": triplet(p.primary),
    "--c-primary-fg": triplet(readableOn(p.primary)),
    "--c-accent": triplet(p.accent),
    "--c-accent-fg": triplet(readableOn(p.accent)),
    "--c-bg": triplet(p.background),
    "--c-surface": triplet(p.surface),
    "--c-text": triplet(p.text),
    "--c-muted": triplet(p.muted),
    "--c-border": triplet(p.border),
    "--radius": RADIUS_PX[theme.radius] ?? "10px",
    "--font-heading": fonts.heading,
    "--font-body": fonts.body,
  } as CSSProperties;
}

export const isDark = (theme: Theme) => luminance(theme.palette.background) < 0.2;

/** Mix two hex colours (t=0 → a, t=1 → b). */
export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Lift/darken brand colours that would disappear on a tone band (e.g. dark green on near-black). */
function brandOn(primary: string, accent: string, bg: string, towards: string): Record<string, string> {
  const fix = (c: string) => {
    let out = c;
    for (let t = 0.15; contrastRatio(out, bg) < 4.5 && t <= 0.9; t += 0.1) out = mix(c, towards, t);
    return out;
  };
  const pr = fix(primary), ac = fix(accent);
  return { "--c-primary": triplet(pr), "--c-primary-fg": triplet(readableOn(pr)), "--c-accent": triplet(ac), "--c-accent-fg": triplet(readableOn(ac)) };
}

/**
 * CSS-variable overrides for a section's `tone`. "dark" gives a deep band tinted
 * with the brand colour; "light" gives a light band. Brand colours are kept.
 */
export function toneVars(theme: Theme, tone: "auto" | "dark" | "light" | undefined): CSSProperties | undefined {
  if (!tone || tone === "auto") return undefined;
  const p = theme.palette;
  if (tone === "dark") {
    if (isDark(theme)) return undefined;
    const base = luminance(p.text) < 0.03 ? p.text : "#0d0e14";
    const bg = mix(base, p.primary, 0.08);
    return {
      ...brandOn(p.primary, p.accent, bg, "#ffffff"),
      "--c-bg": triplet(bg),
      "--c-surface": triplet(mix(bg, "#ffffff", 0.06)),
      "--c-text": triplet("#f5f5f7"),
      "--c-muted": triplet("#a7a9b8"),
      "--c-border": triplet(mix(bg, "#ffffff", 0.14)),
    } as CSSProperties;
  }
  if (!isDark(theme)) return undefined;
  const bg = mix("#ffffff", p.primary, 0.04);
  return {
    ...brandOn(p.primary, p.accent, bg, "#000000"),
    "--c-bg": triplet(bg),
    "--c-surface": triplet(mix(bg, "#000000", 0.04)),
    "--c-text": triplet("#111118"),
    "--c-muted": triplet("#5b5d72"),
    "--c-border": triplet("#e4e4ee"),
  } as CSSProperties;
}
