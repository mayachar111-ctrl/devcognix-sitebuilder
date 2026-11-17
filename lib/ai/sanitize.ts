/**
 * Turns loosely-shaped LLM output into a valid SiteData without another LLM
 * call where possible: unknown keys are dropped, values are coerced field by
 * field against the zod props schemas, arrays are trimmed to their limits, and
 * image keys from the curated catalogue become real URLs. Anything that can't
 * be saved is removed so the renderer's defaults take over.
 */
import { z } from "zod";
import {
  FONT_PAIRS, RADII, SECTION_PROPS, SECTION_TONES, SECTION_TYPES, STYLES,
  type SectionData, type SectionType, type SiteData, type Theme,
} from "@/lib/schema";
import { DEFAULT_THEME } from "@/lib/defaults";
import { contrastRatio, readableOn } from "@/lib/theme";
import { IMAGE_CATEGORIES, ImagePicker, SLOT_SIZES, SCENES, keyForUrl } from "@/lib/images";

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => !!v && typeof v === "object" && !Array.isArray(v);

/* ---------------------------------------------------------------- coercion */

function emptyFor(schema: z.ZodTypeAny): Json {
  if (schema instanceof z.ZodString) return "";
  if (schema instanceof z.ZodNumber) return 0;
  if (schema instanceof z.ZodBoolean) return false;
  if (schema instanceof z.ZodArray) return [];
  if (schema instanceof z.ZodEnum) return (schema._def.values as string[])[0];
  if (schema instanceof z.ZodUnion) return emptyFor(schema._def.options[0]);
  if (schema instanceof z.ZodLiteral) return schema._def.value;
  if (schema instanceof z.ZodObject) return coerce(schema, {}) ?? {};
  if (schema instanceof z.ZodOptional) return undefined;
  return null;
}

function toNumber(v: Json): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Best-effort coercion of `value` to `schema`. Returns undefined when hopeless. */
export function coerce(schema: z.ZodTypeAny, value: Json): Json {
  const direct = schema.safeParse(value);
  if (direct.success) return direct.data;
  if (schema instanceof z.ZodOptional) return value === undefined ? undefined : coerce(schema._def.innerType, value);
  if (schema instanceof z.ZodString) {
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return undefined;
  }
  if (schema instanceof z.ZodNumber) {
    let n = toNumber(value);
    if (n === undefined) return undefined;
    for (const c of schema._def.checks as { kind: string; value: number }[]) {
      if (c.kind === "min") n = Math.max(n, c.value);
      if (c.kind === "max") n = Math.min(n, c.value);
      if (c.kind === "int") n = Math.round(n);
    }
    return n;
  }
  if (schema instanceof z.ZodBoolean) {
    if (value === "true" || value === 1) return true;
    if (value === "false" || value === 0) return false;
    return undefined;
  }
  if (schema instanceof z.ZodEnum) {
    const opts = schema._def.values as string[];
    if (typeof value !== "string") return undefined;
    const lower = value.toLowerCase().trim();
    return opts.find((o) => o.toLowerCase() === lower);
  }
  if (schema instanceof z.ZodUnion) {
    const opts = schema._def.options as z.ZodTypeAny[];
    // number-literal unions (e.g. columns 2|3|4): pick the closest
    const lits = opts.filter((o) => o instanceof z.ZodLiteral).map((o) => o._def.value);
    const n = toNumber(value);
    if (lits.length === opts.length && n !== undefined && lits.every((l) => typeof l === "number")) {
      return (lits as number[]).reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
    }
    for (const o of opts) {
      const r = coerce(o, value);
      if (r !== undefined) return r;
    }
    return undefined;
  }
  if (schema instanceof z.ZodArray) {
    if (!Array.isArray(value)) return undefined;
    const el = schema._def.type as z.ZodTypeAny;
    const out = value.map((v) => coerce(el, v)).filter((v) => v !== undefined);
    const max = schema._def.maxLength?.value as number | undefined;
    return max !== undefined ? out.slice(0, max) : out;
  }
  if (schema instanceof z.ZodObject) {
    if (!isObj(value)) return undefined;
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const out: Record<string, Json> = {};
    for (const [k, s] of Object.entries(shape)) {
      const v = k in value ? coerce(s, value[k]) : undefined;
      out[k] = v === undefined ? emptyFor(s) : v;
      if (out[k] === undefined) delete out[k];
    }
    return schema.safeParse(out).success ? out : undefined;
  }
  return undefined;
}

/** Per-key cleanup of a section's (partial) props. */
export function sanitizeProps(type: SectionType, props: Json): Record<string, Json> {
  const shape = (SECTION_PROPS[type] as z.ZodObject<z.ZodRawShape>).shape as Record<string, z.ZodTypeAny>;
  const out: Record<string, Json> = {};
  if (!isObj(props)) return out;
  for (const [k, v] of Object.entries(props)) {
    if (!(k in shape)) continue;
    const c = coerce(shape[k], v);
    if (c !== undefined) out[k] = c;
  }
  return out;
}

/* ---------------------------------------------------------------- images */

const TYPE_ALIASES: Record<string, SectionType> = {
  nav: "navbar", header: "navbar", hero: "hero-split", "hero-image": "hero-split", features: "features-grid",
  services: "features-grid", "feature-grid": "features-grid", rows: "feature-rows", cta: "cta-banner",
  "call-to-action": "cta-banner", logos: "logo-strip", reviews: "testimonials", "how-it-works": "process",
  timeline: "process", steps: "process", blog: "blog-cards", form: "contact", "contact-form": "contact",
  schedule: "features-grid", plans: "pricing",
};

const imgObj = (picker: ImagePicker, v: Json, size: { w: number; h: number }) => {
  const o = isObj(v) ? v : { src: typeof v === "string" ? v : "", alt: "" };
  const r = picker.scene(String(o.src ?? ""), size);
  const alt = typeof o.alt === "string" && o.alt.trim() ? o.alt : r.alt ?? "";
  return { src: r.src, alt };
};

/** Resolve catalogue keys / unknown URLs in one section's props (mutates). */
export function resolveImages(type: SectionType, props: Record<string, Json>, picker: ImagePicker, fill = true) {
  const has = (k: string) => fill || k in props;
  const arr = (k: string) => (Array.isArray(props[k]) ? (props[k] as Record<string, Json>[]) : null);
  switch (type) {
    case "hero-centered":
      if (has("image")) {
        // An explicitly empty src hides the hero image: respect it. Missing → pick one.
        const explicitEmpty = isObj(props.image) && typeof props.image.src === "string" && !props.image.src.trim();
        if (!explicitEmpty) props.image = imgObj(picker, props.image, SLOT_SIZES.hero);
      }
      break;
    case "hero-split":
      if (has("image")) props.image = imgObj(picker, props.image, SLOT_SIZES.heroSplit);
      break;
    case "feature-rows":
      arr("rows")?.forEach((r) => (r.image = imgObj(picker, r.image, SLOT_SIZES.row)));
      break;
    case "gallery":
      if (has("images")) props.images = (arr("images")?.length ? arr("images")! : Array.from({ length: 6 }, () => ({}))).map((i) => imgObj(picker, i, SLOT_SIZES.gallery));
      break;
    case "blog-cards":
      arr("posts")?.forEach((p) => (p.image = imgObj(picker, p.image, SLOT_SIZES.blog)));
      break;
    case "video":
      if (has("poster")) props.poster = imgObj(picker, props.poster, SLOT_SIZES.poster);
      if (typeof props.embedUrl === "string" && !/^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com|player\.vimeo\.com)\//.test(props.embedUrl)) delete props.embedUrl;
      break;
    case "team":
      arr("members")?.forEach((m) => (m.photo = picker.portrait(String(m.photo ?? ""), SLOT_SIZES.team, false)));
      break;
    case "testimonials":
      arr("items")?.forEach((t) => (t.avatar = picker.portrait(String(t.avatar ?? ""), SLOT_SIZES.avatar, true)));
      break;
  }
}

/** Most common catalogue category among the site's images (for edits). */
export function inferCategory(site: SiteData): string {
  const counts: Record<string, number> = {};
  JSON.stringify(site).replace(/photo-[0-9a-f]+-[0-9a-f]+/g, (m) => {
    const k = keyForUrl(m);
    const cat = k && SCENES.find((s) => s.key === k)?.cat;
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
    return m;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "office";
}

export function pickerForSite(site: SiteData | null, category?: string) {
  const picker = new ImagePicker(category && IMAGE_CATEGORIES.includes(category) ? category : site ? inferCategory(site) : "office");
  if (site) JSON.stringify(site).replace(/https:\/\/images\.unsplash\.com\/photo-[^"\s]+/g, (m) => (picker.markUsed(m), m));
  return picker;
}

/* ---------------------------------------------------------------- sections */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function normaliseType(t: Json): SectionType | null {
  if (typeof t !== "string") return null;
  const k = t.toLowerCase().trim();
  if ((SECTION_TYPES as string[]).includes(k)) return k as SectionType;
  return TYPE_ALIASES[k] ?? null;
}

export function sanitizeSection(raw: Json, takenIds: Set<string>, picker: ImagePicker, fill = true): SectionData | null {
  if (!isObj(raw)) return null;
  const type = normaliseType(raw.type);
  if (!type) return null;
  const props = sanitizeProps(type, raw.props);
  resolveImages(type, props, picker, fill);
  let id = typeof raw.id === "string" && slug(raw.id) ? slug(raw.id) : `${type}-1`;
  if (takenIds.has(id)) {
    let n = 1;
    const base = id.replace(/-\d+$/, "");
    while (takenIds.has(`${base}-${n}`)) n++;
    id = `${base}-${n}`;
  }
  takenIds.add(id);
  if (type === "pricing" && typeof props.currency === "string" && RUPEE.test(props.currency.trim())) props.currency = "₹";
  const section = { id, type, props } as SectionData;
  if (typeof raw.tone === "string" && (SECTION_TONES as readonly string[]).includes(raw.tone) && raw.tone !== "auto") section.tone = raw.tone as SectionData["tone"];
  return section;
}

/* ---------------------------------------------------------------- theme */

const HEX = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
function hex(v: Json, fallback: string) {
  if (typeof v !== "string" || !HEX.test(v.trim())) return fallback;
  let h = v.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return "#" + h.toUpperCase();
}

export function sanitizeTheme(raw: Json, base: Theme = DEFAULT_THEME): Theme {
  const t = isObj(raw) ? raw : {};
  const p = isObj(t.palette) ? t.palette : {};
  const palette = Object.fromEntries(
    (Object.keys(base.palette) as (keyof Theme["palette"])[]).map((k) => [k, hex(p[k], base.palette[k])]),
  ) as Theme["palette"];
  // Guard readability: body text must stand out from the background.
  if (contrastRatio(palette.text, palette.background) < 4.5) palette.text = readableOn(palette.background) === "#ffffff" ? "#F5F5F7" : "#111118";
  if (contrastRatio(palette.muted, palette.background) < 2.8) palette.muted = readableOn(palette.background) === "#ffffff" ? "#A7A9B8" : "#5B5D72";
  const pick = <T extends readonly string[]>(opts: T, v: Json, d: T[number]): T[number] =>
    typeof v === "string" && opts.includes(v) ? (v as T[number]) : d;
  return {
    palette,
    fontPair: pick(FONT_PAIRS, t.fontPair, base.fontPair),
    radius: pick(RADII, t.radius, base.radius),
    style: pick(STYLES, t.style, base.style),
  };
}

/* ---------------------------------------------------------------- links */

/** Anchor each section type renders (SectionShell ids). Section ids are anchors too (renderer). */
const TYPE_ANCHOR: Partial<Record<SectionType, string>> = {
  "features-grid": "features", pricing: "pricing", faq: "faq", contact: "contact", testimonials: "testimonials",
  gallery: "gallery", team: "team", process: "process", "blog-cards": "blog", video: "video", newsletter: "newsletter",
};

/** Point every in-page link at an anchor that exists on that page. */
export function fixAnchors(sections: SectionData[]) {
  const valid = new Set<string>();
  const idToAnchor = new Map<string, string>();
  for (const s of sections) {
    if (TYPE_ANCHOR[s.type] && !idToAnchor.has(s.id)) idToAnchor.set(s.id, TYPE_ANCHOR[s.type]!);
    valid.add(s.id);
    const a = TYPE_ANCHOR[s.type];
    if (a) valid.add(a);
  }
  const fallback = valid.has("contact") ? "#contact" : "#";
  const fix = (href: string) => {
    if (!href.startsWith("#") || href === "#") return href;
    const h = href.slice(1).toLowerCase();
    if (idToAnchor.has(h)) return "#" + idToAnchor.get(h);
    if (valid.has(h)) return "#" + h;
    const base = h.replace(/-\d+$/, "");
    if (valid.has(base)) return "#" + base;
    const byWord = [...valid].find((v) => v.startsWith(base) || base.startsWith(v));
    return byWord ? "#" + byWord : fallback;
  };
  const walk = (v: Json): void => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!isObj(v)) return;
    if (typeof v.href === "string" && typeof v.label === "string") v.href = fix(v.href);
    else if (typeof v.href === "string" && "platform" in v) return;
    for (const x of Object.values(v)) walk(x);
  };
  sections.forEach((s) => walk(s.props));
}

const RUPEE = /^(inr|rs\.?|rupees?|₹)$/i;

/* ---------------------------------------------------------------- site */

export function sanitizeSite(raw: Json): SiteData {
  const r = isObj(raw) ? raw : {};
  const category = typeof r.industry === "string" ? r.industry : typeof r.imageCategory === "string" ? r.imageCategory : undefined;
  const picker = pickerForSite(null, category);
  const rawPages = Array.isArray(r.pages) ? r.pages : Array.isArray(r.sections) ? [{ slug: "home", title: r.name, sections: r.sections }] : [];
  const pages = rawPages
    .filter(isObj)
    .map((pg, i) => {
      const taken = new Set<string>();
      let sections = (Array.isArray(pg.sections) ? pg.sections : [])
        .map((s) => sanitizeSection(s, taken, picker))
        .filter((s): s is SectionData => !!s);
      // Keep navbar first and footer last.
      const nav = sections.filter((s) => s.type === "navbar").slice(0, 1);
      const foot = sections.filter((s) => s.type === "footer").slice(-1);
      sections = [...nav, ...sections.filter((s) => s.type !== "navbar" && s.type !== "footer"), ...foot];
      fixAnchors(sections);
      const pslug = i === 0 ? "home" : slug(String(pg.slug ?? `page-${i + 1}`)) || `page-${i + 1}`;
      return { slug: pslug, title: String(pg.title ?? r.name ?? "Home"), sections };
    })
    .filter((p) => p.sections.length > 0);
  if (!pages.length) throw new Error("The AI response contained no usable sections.");
  return {
    name: String(r.name ?? "My website").slice(0, 80),
    description: String(r.description ?? "").slice(0, 300),
    theme: sanitizeTheme(r.theme),
    pages,
  };
}
