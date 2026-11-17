import type { PropsOf, SectionType, SectionData, Theme } from "./schema";

/** Unsplash CDN helper (IDs verified reachable). */
export const unsplash = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&q=75&auto=format&fit=crop`;

export const DEFAULT_THEME: Theme = {
  palette: {
    primary: "#4F46E5",
    accent: "#EC4899",
    background: "#FFFFFF",
    surface: "#F6F6FB",
    text: "#0F1020",
    muted: "#5B5D72",
    border: "#E4E4EE",
  },
  fontPair: "modern",
  radius: "lg",
  style: "soft",
};

type Defaults = { [T in SectionType]: PropsOf<T> };

export const SECTION_DEFAULTS: Defaults = {
  navbar: {
    brand: "Brightside",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Get started", href: "#contact" },
    sticky: true,
  },
  "hero-centered": {
    eyebrow: "New · Version 2.0",
    headline: "Make the next thing you launch feel effortless",
    subheadline: "A short, confident sentence that explains what you do, who it is for and why it matters.",
    primaryCta: { label: "Start free", href: "#pricing" },
    secondaryCta: { label: "See how it works", href: "#features" },
    image: { src: unsplash("1460925895917-afdab827c52f", 1800, 1000), alt: "Dashboard on a laptop" },
  },
  "hero-split": {
    eyebrow: "Welcome",
    headline: "A headline that says exactly what you offer",
    subheadline: "Support it with one or two sentences about the outcome your customers get.",
    bullets: ["First clear benefit", "Second clear benefit", "Third clear benefit"],
    primaryCta: { label: "Book now", href: "#contact" },
    secondaryCta: { label: "Learn more", href: "#features" },
    image: { src: unsplash("1522071820081-009f0129c71c", 1200, 1400), alt: "People working together" },
    imageSide: "right",
    badge: "Rated 4.9 by 1,200+ customers",
  },
  "hero-gradient": {
    badge: "Now in public beta",
    headline: "Build something people",
    highlight: "can't stop using",
    subheadline: "Bold statement backed by a calm explanation. Keep it under thirty words.",
    primaryCta: { label: "Get early access", href: "#newsletter" },
    secondaryCta: { label: "Watch demo", href: "#video" },
    note: "No credit card required",
  },
  "logo-strip": {
    title: "Trusted by teams at",
    logos: ["Northwind", "Halcyon", "Quanta", "Lumen & Co", "Parallel", "Arcadia"],
    marquee: false,
  },
  "features-grid": {
    eyebrow: "Features",
    title: "Everything you need, nothing you don't",
    subtitle: "Six reasons customers pick us — edit these to match your product.",
    columns: 3,
    items: [
      { icon: "bolt", title: "Fast by default", description: "Pages load in a blink on any connection." },
      { icon: "shield", title: "Secure", description: "Sensible protections switched on from day one." },
      { icon: "chart", title: "Insightful", description: "See what is working and double down on it." },
      { icon: "users", title: "Collaborative", description: "Invite your team and work together in real time." },
      { icon: "globe", title: "Global", description: "Reach customers in any language and currency." },
      { icon: "heart", title: "Loved support", description: "Real humans reply within the hour." },
    ],
  },
  "feature-rows": {
    eyebrow: "How it helps",
    title: "Built around the way you work",
    subtitle: "",
    rows: [
      {
        title: "Plan with clarity",
        description: "Turn scattered ideas into a clear plan everyone can follow.",
        bullets: ["Shared roadmaps", "Smart reminders"],
        image: { src: unsplash("1551434678-e076c223a692", 1200, 900), alt: "Team planning session" },
      },
      {
        title: "Ship with confidence",
        description: "Know exactly what is going out and when, with zero surprises.",
        bullets: ["Release checklists", "One-click rollbacks"],
        image: { src: unsplash("1498050108023-c5249f4df085", 1200, 900), alt: "Code on a laptop" },
      },
    ],
  },
  stats: {
    title: "",
    items: [
      { value: 12000, prefix: "", suffix: "+", label: "Happy customers" },
      { value: 98, prefix: "", suffix: "%", label: "Satisfaction" },
      { value: 24, prefix: "", suffix: "/7", label: "Support" },
      { value: 40, prefix: "", suffix: "+", label: "Cities" },
    ],
    tinted: false,
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "People like you, saying nice things",
    subtitle: "",
    items: [
      { quote: "We replaced three tools with this and our week got noticeably calmer.", name: "Ananya Rao", role: "Operations Lead", avatar: unsplash("1494790108377-be9c29b29330", 160, 160), rating: 5 },
      { quote: "Setup took an afternoon. The results showed up the same month.", name: "Daniel Okafor", role: "Founder", avatar: unsplash("1500648767791-00dcc994a43e", 160, 160), rating: 5 },
      { quote: "Honest pricing, thoughtful product, and support that actually cares.", name: "Meera Shah", role: "Marketing Manager", avatar: unsplash("1438761681033-6461ffad8d80", 160, 160), rating: 5 },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple plans that grow with you",
    subtitle: "Start small, upgrade when you're ready. Cancel anytime.",
    currency: "$",
    billingToggle: true,
    yearlyNote: "Save 20%",
    plans: [
      { name: "Starter", priceMonthly: 0, priceYearly: 0, period: "/month", description: "For trying things out.", features: ["1 project", "Basic analytics", "Community support"], cta: { label: "Start free", href: "#" }, highlighted: false },
      { name: "Pro", priceMonthly: 29, priceYearly: 23, period: "/month", description: "For growing teams.", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domain"], cta: { label: "Go Pro", href: "#" }, highlighted: true },
      { name: "Business", priceMonthly: 79, priceYearly: 63, period: "/month", description: "For larger organisations.", features: ["Everything in Pro", "SSO & audit logs", "Dedicated manager"], cta: { label: "Talk to sales", href: "#contact" }, highlighted: false },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    subtitle: "Can't find what you're looking for? Reach out — we reply fast.",
    items: [
      { question: "How long does setup take?", answer: "Most people are up and running in under ten minutes." },
      { question: "Can I cancel anytime?", answer: "Yes. There are no contracts and no cancellation fees." },
      { question: "Do you offer refunds?", answer: "If it isn't right for you within 14 days, we'll refund you in full." },
      { question: "Is my data safe?", answer: "Data is encrypted in transit and at rest, and backed up daily." },
    ],
  },
  "cta-banner": {
    title: "Ready when you are",
    subtitle: "Join thousands of customers who made the switch this year.",
    primaryCta: { label: "Get started", href: "#contact" },
    secondaryCta: { label: "Contact us", href: "#contact" },
    variant: "gradient",
  },
  gallery: {
    eyebrow: "Gallery",
    title: "A closer look",
    subtitle: "",
    layout: "masonry",
    images: [
      { src: "https://picsum.photos/seed/dc-g1/800/1000", alt: "Gallery image 1" },
      { src: "https://picsum.photos/seed/dc-g2/800/600", alt: "Gallery image 2" },
      { src: "https://picsum.photos/seed/dc-g3/800/800", alt: "Gallery image 3" },
      { src: "https://picsum.photos/seed/dc-g4/800/600", alt: "Gallery image 4" },
      { src: "https://picsum.photos/seed/dc-g5/800/1000", alt: "Gallery image 5" },
      { src: "https://picsum.photos/seed/dc-g6/800/700", alt: "Gallery image 6" },
    ],
  },
  team: {
    eyebrow: "Team",
    title: "The people behind it",
    subtitle: "",
    members: [
      { name: "Riya Kapoor", role: "Founder", photo: unsplash("1544005313-94ddf0286df2", 600, 700), bio: "Obsessed with making hard things simple." },
      { name: "Arjun Mehta", role: "Engineering", photo: unsplash("1507003211169-0a1dd7228f2d", 600, 700), bio: "Builds the things that never break." },
      { name: "Sara Thomas", role: "Design", photo: unsplash("1534528741775-53994a69daeb", 600, 700), bio: "Sweats the details so you don't have to." },
      { name: "Kabir Singh", role: "Customer Success", photo: unsplash("1472099645785-5658abf4ff4e", 600, 700), bio: "Your first call when you need anything." },
    ],
  },
  process: {
    eyebrow: "Process",
    title: "How it works",
    subtitle: "Three simple steps from first hello to finished result.",
    steps: [
      { title: "Tell us what you need", description: "A short call or form to understand your goals.", meta: "Day 1" },
      { title: "We get to work", description: "You get regular updates and nothing is a surprise.", meta: "Week 1–2" },
      { title: "Launch and grow", description: "We hand over, then stay around to help you grow.", meta: "Ongoing" },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's talk",
    subtitle: "Send a message and we'll get back to you within one working day.",
    email: "hello@example.com",
    phone: "+91 98765 43210",
    address: "2nd Floor, 14 MG Road, Bengaluru 560001",
    hours: "Mon–Sat, 9:00–18:00",
    submitLabel: "Send message",
    successMessage: "Thanks! We'll be in touch shortly.",
    showServiceField: false,
    services: ["General enquiry", "Pricing", "Partnership"],
  },
  newsletter: {
    title: "Get the good stuff, monthly",
    subtitle: "One email a month with ideas, updates and the occasional discount.",
    placeholder: "you@example.com",
    buttonLabel: "Subscribe",
    note: "No spam. Unsubscribe in one click.",
  },
  "blog-cards": {
    eyebrow: "Journal",
    title: "Latest from the blog",
    subtitle: "",
    posts: [
      { title: "Five small changes that compound", excerpt: "Tiny habits that quietly make every week better.", image: { src: unsplash("1497366216548-37526070297c", 900, 600), alt: "Bright office" }, category: "Guides", date: "02 Nov 2026", href: "#" },
      { title: "What we learned shipping weekly", excerpt: "A year of small releases and what it taught us.", image: { src: unsplash("1556761175-5973dc0f32e7", 900, 600), alt: "Team meeting" }, category: "Stories", date: "21 Oct 2026", href: "#" },
      { title: "A practical guide to getting started", excerpt: "Everything you need for a strong first month.", image: { src: unsplash("1531297484001-80022131f5a1", 900, 600), alt: "Laptop on desk" }, category: "Product", date: "08 Oct 2026", href: "#" },
    ],
  },
  video: {
    eyebrow: "See it in action",
    title: "Two minutes is all it takes",
    subtitle: "",
    embedUrl: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
    poster: { src: unsplash("1600880292203-757bb62b4baf", 1800, 1000), alt: "Video preview" },
    caption: "",
  },
  footer: {
    brand: "Brightside",
    tagline: "Making the next thing you launch feel effortless.",
    columns: [
      { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
      { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }] },
      { title: "Help", links: [{ label: "Contact", href: "#contact" }, { label: "FAQ", href: "#faq" }] },
    ],
    socials: [
      { platform: "instagram", href: "#" },
      { platform: "linkedin", href: "#" },
      { platform: "x", href: "#" },
    ],
    copyright: "© 2026 Brightside. All rights reserved.",
  },
};

/** Section library metadata for the editor's "add section" panel. */
export const SECTION_LIBRARY: { type: SectionType; label: string; category: string; description: string }[] = [
  { type: "navbar", label: "Navbar", category: "Navigation", description: "Brand, links and a call-to-action" },
  { type: "hero-centered", label: "Hero · Centered", category: "Hero", description: "Big centred headline with a wide image" },
  { type: "hero-split", label: "Hero · Split image", category: "Hero", description: "Text on one side, photo on the other" },
  { type: "hero-gradient", label: "Hero · Gradient", category: "Hero", description: "Animated colour background, bold type" },
  { type: "logo-strip", label: "Logo strip", category: "Social proof", description: "Row or marquee of client names" },
  { type: "features-grid", label: "Features grid", category: "Content", description: "Icon cards in 2–4 columns" },
  { type: "feature-rows", label: "Feature rows", category: "Content", description: "Alternating image + text rows" },
  { type: "stats", label: "Stats", category: "Social proof", description: "Animated counters" },
  { type: "testimonials", label: "Testimonials", category: "Social proof", description: "Customer quotes with ratings" },
  { type: "pricing", label: "Pricing", category: "Commerce", description: "Plans with monthly/yearly toggle" },
  { type: "faq", label: "FAQ", category: "Content", description: "Accordion of questions" },
  { type: "cta-banner", label: "CTA banner", category: "Conversion", description: "Bold call-to-action band" },
  { type: "gallery", label: "Gallery", category: "Media", description: "Masonry or grid with lightbox" },
  { type: "team", label: "Team", category: "Content", description: "Photos, roles and short bios" },
  { type: "process", label: "Process / timeline", category: "Content", description: "Numbered steps" },
  { type: "contact", label: "Contact form", category: "Conversion", description: "Form plus contact details" },
  { type: "newsletter", label: "Newsletter", category: "Conversion", description: "Email capture" },
  { type: "blog-cards", label: "Blog cards", category: "Content", description: "Article previews" },
  { type: "video", label: "Video", category: "Media", description: "Poster that plays an embed" },
  { type: "footer", label: "Footer", category: "Navigation", description: "Links, socials and copyright" },
];

export function withDefaults<T extends SectionType>(type: T, props: Partial<PropsOf<T>> | undefined): PropsOf<T> {
  return { ...SECTION_DEFAULTS[type], ...(props ?? {}) } as PropsOf<T>;
}

export function newSection(type: SectionType, existingIds: string[] = []): SectionData {
  let i = 1;
  while (existingIds.includes(`${type}-${i}`)) i++;
  const props = JSON.parse(JSON.stringify(SECTION_DEFAULTS[type]));
  return { id: `${type}-${i}`, type, props } as SectionData;
}
