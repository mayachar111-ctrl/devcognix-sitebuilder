/**
 * DevCognix site schema — the single contract between the AI generator,
 * the editor, the renderer and storage.
 *
 * Shape:
 *   Site { name, theme { palette, fontPair, radius, style }, pages[ { slug, title, sections[ { id, type, props } ] } ] }
 *
 * Every section `props` object is PARTIAL at the site level: anything omitted
 * is filled from lib/defaults.ts at render time. That keeps LLM output short
 * and makes the schema forgiving.
 */
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export const ICON_NAMES = [
  "sparkles", "bolt", "shield", "chart", "globe", "heart", "clock", "users",
  "star", "check", "leaf", "cup", "phone", "mail", "map", "calendar", "code",
  "layers", "rocket", "smile", "award", "camera", "wallet", "chat",
] as const;
export const IconName = z.enum(ICON_NAMES).describe("Icon from the built-in icon set");
export type IconName = z.infer<typeof IconName>;

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "6-digit hex colour like #4F46E5")
  .describe("6-digit hex colour, e.g. #4F46E5");

export const Link = z.object({
  label: z.string().describe("Visible text"),
  href: z.string().describe("URL, #anchor or /path"),
});
export type Link = z.infer<typeof Link>;

export const Image = z.object({
  src: z.string().describe("Absolute image URL (https://images.unsplash.com/... or https://picsum.photos/seed/<word>/<w>/<h>)"),
  alt: z.string().describe("Alt text describing the image"),
});
export type Image = z.infer<typeof Image>;

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export const FONT_PAIRS = ["modern", "editorial", "geometric", "friendly", "classic", "mono-tech"] as const;
export const RADII = ["none", "sm", "md", "lg", "xl"] as const;
export const STYLES = ["minimal", "soft", "bold", "glass"] as const;

export const Theme = z.object({
  palette: z
    .object({
      primary: hex.describe("Brand colour used for buttons, links, highlights"),
      accent: hex.describe("Secondary brand colour for gradients and badges"),
      background: hex.describe("Page background"),
      surface: hex.describe("Card / alternate section background"),
      text: hex.describe("Main text colour; must contrast strongly with background"),
      muted: hex.describe("Secondary text colour"),
      border: hex.describe("Hairline borders"),
    })
    .describe("Colour palette. Dark themes: dark background + light text."),
  fontPair: z
    .enum(FONT_PAIRS)
    .describe(
      "modern=Inter; editorial=Fraunces headings + Inter body; geometric=Space Grotesk + DM Sans; friendly=Poppins + Nunito; classic=Playfair Display + Source Sans 3; mono-tech=JetBrains Mono headings + Inter body",
    ),
  radius: z.enum(RADII).describe("Corner rounding for cards and buttons"),
  style: z
    .enum(STYLES)
    .describe("minimal=flat hairlines; soft=gentle shadows; bold=thick borders + offset shadows; glass=translucent blurred cards"),
});
export type Theme = z.infer<typeof Theme>;

/* ------------------------------------------------------------------ */
/* Section props (full shapes; site-level sections accept partials)    */
/* ------------------------------------------------------------------ */

const sectionHeader = {
  eyebrow: z.string().describe("Small label above the title (can be empty)"),
  title: z.string(),
  subtitle: z.string(),
};

export const NavbarProps = z.object({
  brand: z.string().describe("Brand name shown as wordmark"),
  links: z.array(Link).max(6),
  cta: Link.describe("Button on the right; empty label hides it"),
  sticky: z.boolean(),
});

export const HeroCenteredProps = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  primaryCta: Link,
  secondaryCta: Link.describe("Empty label hides it"),
  image: Image.describe("Wide product/hero image under the text; empty src hides it"),
});

export const HeroSplitProps = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  bullets: z.array(z.string()).max(5),
  primaryCta: Link,
  secondaryCta: Link,
  image: Image,
  imageSide: z.enum(["left", "right"]),
  badge: z.string().describe("Floating badge text on the image, e.g. '4.9 ★ on Google'; empty hides"),
});

export const HeroGradientProps = z.object({
  badge: z.string(),
  headline: z.string(),
  highlight: z.string().describe("Words appended to the headline, rendered in an animated gradient"),
  subheadline: z.string(),
  primaryCta: Link,
  secondaryCta: Link,
  note: z.string().describe("Tiny reassurance line under buttons"),
});

export const LogoStripProps = z.object({
  title: z.string(),
  logos: z.array(z.string()).describe("Company names rendered as typographic wordmarks"),
  marquee: z.boolean().describe("Scroll the logos continuously"),
});

export const FeaturesGridProps = z.object({
  ...sectionHeader,
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  items: z.array(z.object({ icon: IconName, title: z.string(), description: z.string() })).max(12),
});

export const FeatureRowsProps = z.object({
  ...sectionHeader,
  rows: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        bullets: z.array(z.string()).max(5),
        image: Image,
      }),
    )
    .max(5),
});

export const StatsProps = z.object({
  title: z.string().describe("Optional heading; empty hides"),
  items: z
    .array(z.object({ value: z.number(), prefix: z.string(), suffix: z.string(), label: z.string() }))
    .max(6),
  tinted: z.boolean().describe("Render on a primary-coloured band"),
});

export const TestimonialsProps = z.object({
  ...sectionHeader,
  items: z
    .array(
      z.object({
        quote: z.string(),
        name: z.string(),
        role: z.string(),
        avatar: z.string().describe("Avatar image URL; empty shows initials"),
        rating: z.number().min(0).max(5),
      }),
    )
    .max(9),
});

export const PricingProps = z.object({
  ...sectionHeader,
  currency: z.string().describe("Currency symbol, e.g. ₹ or $"),
  billingToggle: z.boolean().describe("Show monthly/yearly switch"),
  yearlyNote: z.string().describe("e.g. 'Save 20%'"),
  plans: z
    .array(
      z.object({
        name: z.string(),
        priceMonthly: z.number(),
        priceYearly: z.number().describe("Per-month price when billed yearly"),
        period: z.string().describe("e.g. '/month' or '/session'"),
        description: z.string(),
        features: z.array(z.string()).max(10),
        cta: Link,
        highlighted: z.boolean(),
      }),
    )
    .max(4),
});

export const FaqProps = z.object({
  ...sectionHeader,
  items: z.array(z.object({ question: z.string(), answer: z.string() })).max(12),
});

export const CtaBannerProps = z.object({
  title: z.string(),
  subtitle: z.string(),
  primaryCta: Link,
  secondaryCta: Link,
  variant: z.enum(["gradient", "solid", "outline"]),
});

export const GalleryProps = z.object({
  ...sectionHeader,
  images: z.array(Image).max(12),
  layout: z.enum(["masonry", "grid"]),
});

export const TeamProps = z.object({
  ...sectionHeader,
  members: z
    .array(z.object({ name: z.string(), role: z.string(), photo: z.string(), bio: z.string() }))
    .max(8),
});

export const ProcessProps = z.object({
  ...sectionHeader,
  steps: z.array(z.object({ title: z.string(), description: z.string(), meta: z.string().describe("e.g. 'Day 1' or '15 min'") })).max(6),
});

export const ContactProps = z.object({
  ...sectionHeader,
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  hours: z.string(),
  submitLabel: z.string(),
  successMessage: z.string(),
  showServiceField: z.boolean().describe("Adds a 'what do you need?' select"),
  services: z.array(z.string()).describe("Options for the service select"),
});

export const NewsletterProps = z.object({
  title: z.string(),
  subtitle: z.string(),
  placeholder: z.string(),
  buttonLabel: z.string(),
  note: z.string(),
});

export const BlogCardsProps = z.object({
  ...sectionHeader,
  posts: z
    .array(
      z.object({
        title: z.string(),
        excerpt: z.string(),
        image: Image,
        category: z.string(),
        date: z.string().describe("Display date, e.g. '12 Oct 2026'"),
        href: z.string(),
      }),
    )
    .max(6),
});

export const VideoProps = z.object({
  ...sectionHeader,
  embedUrl: z.string().describe("Embeddable URL, e.g. https://www.youtube-nocookie.com/embed/<id>"),
  poster: Image,
  caption: z.string(),
});

export const FooterProps = z.object({
  brand: z.string(),
  tagline: z.string(),
  columns: z.array(z.object({ title: z.string(), links: z.array(Link).max(6) })).max(4),
  socials: z.array(z.object({ platform: z.enum(["instagram", "x", "linkedin", "youtube", "facebook", "whatsapp", "github"]), href: z.string() })).max(6),
  copyright: z.string(),
});

/** Registry of every section type → its full props schema. */
export const SECTION_PROPS = {
  navbar: NavbarProps,
  "hero-centered": HeroCenteredProps,
  "hero-split": HeroSplitProps,
  "hero-gradient": HeroGradientProps,
  "logo-strip": LogoStripProps,
  "features-grid": FeaturesGridProps,
  "feature-rows": FeatureRowsProps,
  stats: StatsProps,
  testimonials: TestimonialsProps,
  pricing: PricingProps,
  faq: FaqProps,
  "cta-banner": CtaBannerProps,
  gallery: GalleryProps,
  team: TeamProps,
  process: ProcessProps,
  contact: ContactProps,
  newsletter: NewsletterProps,
  "blog-cards": BlogCardsProps,
  video: VideoProps,
  footer: FooterProps,
} as const;

export type SectionType = keyof typeof SECTION_PROPS;
export const SECTION_TYPES = Object.keys(SECTION_PROPS) as SectionType[];
export type PropsOf<T extends SectionType> = z.infer<(typeof SECTION_PROPS)[T]>;

/* ------------------------------------------------------------------ */
/* Section / Page / Site                                               */
/* ------------------------------------------------------------------ */

export const SECTION_TONES = ["auto", "dark", "light"] as const;
export const SectionTone = z
  .enum(SECTION_TONES)
  .describe("Per-section colour override: auto=site theme, dark=dark band, light=light band");
export type SectionTone = z.infer<typeof SectionTone>;

const sectionVariant = <T extends SectionType>(type: T) =>
  z.object({
    id: z.string().min(1).describe("Unique id within the page, e.g. 'hero-1'"),
    type: z.literal(type),
    props: SECTION_PROPS[type].partial().describe(`Props for ${type}; omitted keys use defaults`),
    tone: SectionTone.optional(),
  });

const variants = SECTION_TYPES.map((t) => sectionVariant(t));

export const Section = z.discriminatedUnion(
  "type",
  variants as unknown as [ReturnType<typeof sectionVariant>, ...ReturnType<typeof sectionVariant>[]],
);

/** Loosely-typed section used by renderer/editor (props validated per type). */
export type SectionData = { [T in SectionType]: { id: string; type: T; props: Partial<PropsOf<T>>; tone?: SectionTone } }[SectionType];

export const Page = z.object({
  slug: z.string().describe("'home' for the landing page, otherwise kebab-case"),
  title: z.string().describe("Browser tab / SEO title"),
  sections: z.array(Section).min(1),
});

export const Site = z.object({
  name: z.string(),
  description: z.string().describe("One-line SEO description"),
  theme: Theme,
  pages: z.array(Page).min(1),
});

export type SiteData = { name: string; description: string; theme: Theme; pages: { slug: string; title: string; sections: SectionData[] }[] };

export function parseSite(input: unknown): SiteData {
  return Site.parse(input) as unknown as SiteData;
}
export function safeParseSite(input: unknown) {
  return Site.safeParse(input);
}

/* ------------------------------------------------------------------ */
/* LLM helpers                                                         */
/* ------------------------------------------------------------------ */

/** Full JSON Schema (draft-07) of the Site — usable for structured output / tool calling. */
export function siteJsonSchema() {
  return zodToJsonSchema(Site, { name: "Site", $refStrategy: "none" });
}

/** Compact, token-cheap description for prompts. */
export function siteSchemaPrompt(): string {
  const lines: string[] = [
    "Return JSON: { name, description, theme, pages }.",
    `theme = { palette: {primary, accent, background, surface, text, muted, border} (6-digit hex), fontPair: ${FONT_PAIRS.join("|")}, radius: ${RADII.join("|")}, style: ${STYLES.join("|")} }`,
    "pages = [{ slug, title, sections: [{ id, type, props, tone? }] }]. Usually start with navbar, end with footer. Props are optional; omit to use defaults. tone (optional): auto|dark|light recolours just that section.",
    "Link = {label, href}. Image = {src, alt} (use https://images.unsplash.com/photo-<id>?w=1600&q=80 or https://picsum.photos/seed/<word>/1200/800).",
    `icons: ${ICON_NAMES.join(", ")}`,
    "Section types and props:",
  ];
  for (const t of SECTION_TYPES) {
    lines.push(`- ${t}: ${describeShape(SECTION_PROPS[t])}`);
  }
  return lines.join("\n");
}

function describeShape(schema: z.ZodTypeAny): string {
  const def = schema._def;
  if (schema instanceof z.ZodObject) {
    const keys = Object.keys(schema.shape).join(",");
    if (keys === "label,href") return "Link";
    if (keys === "src,alt") return "Image";
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    return "{" + Object.entries(shape).map(([k, v]) => `${k}:${describeShape(v)}`).join(", ") + "}";
  }
  if (schema instanceof z.ZodArray) return `${describeShape(def.type)}[]`;
  if (schema instanceof z.ZodEnum) {
    const opts = def.values as string[];
    return opts.length > 8 ? "icon" : opts.join("|");
  }
  if (schema instanceof z.ZodUnion) return (def.options as z.ZodTypeAny[]).map(describeShape).join("|");
  if (schema instanceof z.ZodLiteral) return String(def.value);
  if (schema instanceof z.ZodString) return "str";
  if (schema instanceof z.ZodNumber) return "num";
  if (schema instanceof z.ZodBoolean) return "bool";
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) return describeShape(def.innerType) + "?";
  return "any";
}
