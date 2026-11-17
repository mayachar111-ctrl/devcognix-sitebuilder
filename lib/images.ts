/**
 * Curated image library for AI generation.
 *
 * The LLM never invents image URLs. It picks keys from this catalogue
 * (written as "img:<key>"), and resolveSiteImages() turns them into sized
 * Unsplash CDN URLs. Every ID below was checked to return HTTP 200 and was
 * reviewed on a contact sheet (Nov 2026) so the description matches the photo.
 */
import { unsplash } from "./defaults";

export type CatalogImage = { key: string; id: string; alt: string; cat: string };

const scene = (cat: string, n: number, id: string, alt: string): CatalogImage => ({ key: `${cat}-${n}`, id, alt, cat });

export const SCENES: CatalogImage[] = [
  // wellness & fitness
  scene("yoga", 1, "1506126613408-eca07ce68773", "Woman meditating in lotus pose at sunset"),
  scene("yoga", 2, "1575052814086-f385e2e2ad1b", "Woman in a deep backbend on a yoga mat indoors"),
  scene("yoga", 3, "1588286840104-8957b019727f", "Group yoga class stretching in a studio"),
  scene("yoga", 4, "1545205597-3d9d02c29597", "Group doing tree pose on a beach at dawn"),
  scene("yoga", 5, "1544367567-0f2fcb009e0b", "Silhouette in a low lunge against a sunset sky"),
  scene("yoga", 6, "1552196563-55cd4e45efb3", "Woman seated cross-legged on a mat, calm and focused"),
  scene("yoga", 7, "1599901860904-17e6ed7083a0", "Black-and-white downward dog on a studio floor"),
  scene("fitness", 1, "1517836357463-d25dfeac3438", "Athlete lifting a loaded barbell"),
  scene("fitness", 2, "1534438327276-14e5300c3a48", "Rows of dumbbells in a bright gym"),
  scene("fitness", 3, "1518611012118-696072aa579a", "Women doing a floor workout class in a loft gym"),
  scene("fitness", 4, "1571019613454-1cb2f99b2d8b", "Woman doing a guided core exercise at home"),
  // health
  scene("dental", 1, "1629909613654-28e377c37b09", "Bright modern dental clinic with treatment chair"),
  scene("dental", 2, "1606811971618-4486d14f3f99", "Close-up of a dental check-up"),
  scene("dental", 3, "1588776814546-1ffcf47267a5", "Dentist reviewing dental X-rays on a lightbox"),
  scene("medical", 1, "1631217868264-e5b90bb7e133", "Doctor smiling while talking with a patient"),
  scene("medical", 2, "1576091160399-112ba8d25d1d", "Doctor in a white coat with stethoscope holding a phone"),
  // spa & beauty
  scene("spa", 1, "1544161515-4ab6ce6db874", "Relaxing oil massage at a spa"),
  scene("spa", 2, "1570172619644-dfd03ed5d881", "Facial treatment with a clay mask"),
  scene("salon", 1, "1560066984-138dadb4c035", "Bright, airy hair salon with styling chairs"),
  scene("salon", 2, "1522337360788-8b13dee7a37e", "Woman with long wavy hair against a pink wall"),
  scene("salon", 3, "1487412947147-5cebf100ffc2", "Makeup being applied, close-up portrait"),
  // finance, legal, business
  scene("finance", 1, "1554224155-6726b3ff858f", "Calculator, pen and financial paperwork"),
  scene("finance", 2, "1554224154-26032ffc0d07", "Tax forms, calculator and coffee on a desk"),
  scene("finance", 3, "1450101499163-c8848c66ca85", "Hand signing a document with a pen"),
  scene("finance", 4, "1600880292203-757bb62b4baf", "Two colleagues high-fiving at a meeting table"),
  scene("finance", 5, "1521791136064-7986c2920216", "Business handshake in an office"),
  scene("finance", 6, "1507679799987-c73779587ccf", "Professional in a suit buttoning his jacket"),
  scene("finance", 7, "1556742049-0cfed4f6a45d", "Shop owner taking a card payment from a customer"),
  scene("finance", 8, "1551434678-e076c223a692", "Team reviewing numbers together"),
  scene("markets", 1, "1590283603385-17ffb3a7f29f", "Stock-market trading screen with candlestick charts"),
  scene("markets", 2, "1611974789855-9c2a0a7236a3", "Red and green candlestick chart on a dark screen"),
  scene("markets", 3, "1563986768609-322da13575f3", "Person using a banking app on laptop and phone"),
  scene("legal", 1, "1589829545856-d10d557cf95f", "Lady Justice statue holding scales"),
  scene("office", 1, "1497366216548-37526070297c", "Bright open-plan office with large windows"),
  scene("office", 2, "1497366811353-6870744d04b2", "Modern office corridor with glass walls"),
  scene("office", 3, "1486406146926-c627a92ad1ab", "Glass office towers seen from below"),
  scene("office", 4, "1556761175-5973dc0f32e7", "Team meeting around a table"),
  scene("office", 5, "1497215728101-856f4ea42174", "Bright office desk by a window"),
  // tech
  scene("tech", 1, "1460925895917-afdab827c52f", "Analytics dashboard on a laptop"),
  scene("tech", 2, "1498050108023-c5249f4df085", "Code on a laptop on a white desk"),
  scene("tech", 3, "1555066931-4365d14bab8c", "Code editor on a laptop in a dark room"),
  scene("tech", 4, "1519389950473-47ba0277781c", "Team working on laptops around a shared table"),
  scene("tech", 5, "1518770660439-4636190af475", "Close-up of a circuit board"),
  scene("tech", 6, "1531297484001-80022131f5a1", "Laptop on a desk at night"),
  // food & hospitality
  scene("food", 1, "1585937421612-70a008356fbe", "Bowls of Indian curry with rice"),
  scene("food", 2, "1565557623262-b51c2513a641", "Indian curry with naan on a plate"),
  scene("food", 3, "1504674900247-0877df9cc836", "Colourful plated dishes seen from above"),
  scene("food", 4, "1414235077428-338989a2e8c0", "Plated food at a dinner table"),
  scene("food", 5, "1540189549336-e6e99c3679fe", "Fresh salad bowl"),
  scene("restaurant", 1, "1517248135467-4c7edcad34c4", "Warm, moody restaurant dining room"),
  scene("restaurant", 2, "1555396273-367ea4eb4db5", "Industrial-style café with long tables"),
  scene("restaurant", 3, "1554118811-1e0d58224f24", "Sunlit café interior with plants"),
  scene("cafe", 1, "1509042239860-f550ce710b93", "Latte with leaf art on a wooden table"),
  scene("cafe", 2, "1442512595331-e89e73853f31", "Pour-over coffee being brewed"),
  scene("cafe", 3, "1495474472287-4d71bcdd2085", "Friends clinking coffee cups"),
  scene("cafe", 4, "1511920170033-f8396924c348", "Freshly ground espresso"),
  // travel & stays
  scene("travel", 1, "1524492412937-b28074a5d7da", "Taj Mahal with its reflecting pool"),
  scene("travel", 2, "1602216056096-3b40cc0c9944", "Kerala houseboat on palm-lined backwaters"),
  scene("travel", 3, "1506461883276-594a12b11cf3", "Houseboat and coconut palms on the backwaters"),
  scene("travel", 4, "1512343879784-a960bf40e7f2", "Turquoise sea and a palm-fringed beach"),
  scene("hotel", 1, "1566073771259-6a8506099945", "Resort pool deck with wooden cottages"),
  scene("hotel", 2, "1520250497591-112f2f40a3f4", "Tropical resort pool surrounded by palms"),
  // property & building
  scene("realestate", 1, "1600596542815-ffad4c1539a9", "Modern white villa with a pool"),
  scene("realestate", 2, "1564013799919-ab600027ffc6", "Large home with a pool and palm trees"),
  scene("realestate", 3, "1512917774080-9991f1c4c750", "Luxury house exterior with poolside terrace"),
  scene("realestate", 4, "1600607687939-ce8a6c25118c", "Minimal living room with a white sofa"),
  scene("realestate", 5, "1560448204-e02f11c3d0e2", "Bright apartment living room"),
  scene("construction", 1, "1503387762-592deb58ef4e", "Architect sketching building plans"),
  scene("construction", 2, "1541888946425-d81bb19240f5", "Engineers on a large construction site"),
  // education
  scene("education", 1, "1509062522246-3755977927d7", "Students in a classroom with a teacher"),
  scene("education", 2, "1503676260728-1c00da094a0b", "Books, an apple and alphabet blocks"),
  scene("education", 3, "1427504494785-3a9ca7044f45", "Student walking between library shelves"),
  scene("education", 4, "1513258496099-48168024aec0", "Student learning on a laptop with headphones"),
  // retail
  scene("retail", 1, "1441986300917-64674bd600d8", "Boutique clothing store interior"),
  scene("retail", 2, "1445205170230-053b83016050", "Clothes hanging on a rail"),
  scene("retail", 3, "1483985988355-763728e1935b", "Woman carrying shopping bags"),
  // auto
  scene("auto", 1, "1487754180451-c456f719a1fc", "Mechanic pouring engine oil"),
  scene("auto", 2, "1486262715619-67b85e0b08d3", "Close-up of a car engine"),
  scene("auto", 3, "1492144534655-ae79c964c9d7", "Sports car in a dark garage"),
  // events
  scene("events", 1, "1511795409834-ef04bbd61622", "Elegant banquet table with flowers"),
  scene("events", 2, "1519741497674-611481863552", "Bride holding a bouquet, moody light"),
  scene("events", 3, "1492684223066-81342ee5ff30", "Confetti over a concert crowd"),
  // pets
  scene("pets", 1, "1548199973-03cce0bbc87b", "Two happy dogs running on a trail"),
  scene("pets", 2, "1450778869180-41d0601e046e", "Dog and cat cuddling on the grass"),
  // creative
  scene("creative", 1, "1618005182384-a83a8bd57fbe", "Abstract flowing gradient artwork"),
  scene("creative", 2, "1626785774573-4b799315345d", "Brand identity design on display"),
  scene("creative", 3, "1513475382585-d06e58bcb0e0", "Printed publication design"),
];

/** Portraits for team photos and testimonial avatars. */
export const PORTRAITS: CatalogImage[] = [
  { key: "woman-1", id: "1494790108377-be9c29b29330", alt: "Smiling woman in a red top", cat: "portrait" },
  { key: "woman-2", id: "1573497019940-1c28c88b4f3e", alt: "Smiling woman with curly hair", cat: "portrait" },
  { key: "woman-3", id: "1580489944761-15a19d654956", alt: "Woman with hair tied up, smiling", cat: "portrait" },
  { key: "woman-4", id: "1607746882042-944635dfe10e", alt: "Woman in a shirt, confident look", cat: "portrait" },
  { key: "woman-5", id: "1544005313-94ddf0286df2", alt: "Woman with long hair outdoors", cat: "portrait" },
  { key: "woman-6", id: "1534528741775-53994a69daeb", alt: "Woman in soft blue light", cat: "portrait" },
  { key: "woman-7", id: "1438761681033-6461ffad8d80", alt: "Woman with short auburn hair", cat: "portrait" },
  { key: "man-1", id: "1507003211169-0a1dd7228f2d", alt: "Smiling man in a white t-shirt", cat: "portrait" },
  { key: "man-2", id: "1500648767791-00dcc994a43e", alt: "Man in a grey sweater", cat: "portrait" },
  { key: "man-3", id: "1472099645785-5658abf4ff4e", alt: "Older man with glasses", cat: "portrait" },
  { key: "doctor-man-1", id: "1612349317150-e413f6a5b16d", alt: "Doctor with glasses and stethoscope", cat: "portrait" },
  { key: "doctor-man-2", id: "1622253692010-333f2da6031d", alt: "Medic in blue scrubs, arms crossed", cat: "portrait" },
  { key: "doctor-woman-1", id: "1594824476967-48c8b964273f", alt: "Clinician in teal scrubs, arms crossed", cat: "portrait" },
];

export const IMAGE_CATEGORIES = Array.from(new Set(SCENES.map((s) => s.cat)));

const BY_KEY = new Map([...SCENES, ...PORTRAITS].map((i) => [i.key, i]));
const BY_ID = new Map([...SCENES, ...PORTRAITS].map((i) => [i.id, i]));

/** Related categories used when a site's main category runs out of photos. */
const RELATED: Record<string, string[]> = {
  yoga: ["fitness", "spa"], fitness: ["yoga"], dental: ["medical"], medical: ["dental", "fitness"],
  spa: ["salon", "yoga"], salon: ["spa"], finance: ["office", "markets", "legal"], markets: ["finance", "tech"],
  legal: ["finance", "office"], office: ["finance", "tech"], tech: ["office", "creative"], food: ["restaurant", "cafe"],
  restaurant: ["food", "cafe"], cafe: ["restaurant", "food"], travel: ["hotel"], hotel: ["travel"],
  realestate: ["construction"], construction: ["realestate", "office"], education: ["office", "tech"],
  retail: ["creative"], auto: ["office"], events: ["food", "restaurant"], pets: ["medical"], creative: ["tech", "office"],
};

/** Compact catalogue for the prompt: one line per category. */
export function imageCatalogPrompt(): string {
  const lines = IMAGE_CATEGORIES.map((c) => `${c}: ` + SCENES.filter((s) => s.cat === c).map((s) => `${s.key} (${s.alt})`).join("; "));
  lines.push("portraits (team photos/avatars only): " + PORTRAITS.map((p) => `${p.key} (${p.alt})`).join("; "));
  return lines.join("\n");
}

/** Reverse lookup used to show the LLM which catalogue image a URL is. */
export function keyForUrl(url: string): string | null {
  const m = /photo-([0-9a-f]+-[0-9a-f]+)/.exec(url ?? "");
  return m ? BY_ID.get(m[1])?.key ?? null : null;
}

type Size = { w: number; h: number };
export const SLOT_SIZES = {
  hero: { w: 1800, h: 1100 },
  heroSplit: { w: 1200, h: 1400 },
  row: { w: 1200, h: 900 },
  gallery: { w: 900, h: 1000 },
  blog: { w: 900, h: 600 },
  poster: { w: 1800, h: 1000 },
  team: { w: 600, h: 700 },
  avatar: { w: 160, h: 160 },
} satisfies Record<string, Size>;

/**
 * Picks images for one site, avoiding repeats. `want` is whatever the LLM wrote
 * (img:key, bare key, or a URL). Unknown values fall back to the site's category.
 */
export class ImagePicker {
  private used = new Set<string>();
  constructor(private category: string) {
    if (!IMAGE_CATEGORIES.includes(category)) this.category = "office";
  }
  /** URLs the user typed themselves (edits) are used verbatim. */
  private allowed = new Set<string>();
  allow(urls: string[]) {
    urls.forEach((u) => this.allowed.add(u));
  }
  markUsed(url: string) {
    const k = keyForUrl(url);
    if (k) this.used.add(k);
  }
  private pool(): CatalogImage[] {
    const cats = [this.category, ...(RELATED[this.category] ?? []), "office", "tech", "creative"];
    const out: CatalogImage[] = [];
    for (const c of cats) for (const s of SCENES) if (s.cat === c && !out.includes(s)) out.push(s);
    return out;
  }
  private take(img: CatalogImage) {
    this.used.add(img.key);
    return img;
  }
  scene(want: string | undefined, size: Size): { src: string; alt?: string } {
    if (want && this.allowed.has(want.trim())) return { src: want.trim() };
    const hit = lookup(want);
    if (hit && hit.cat !== "portrait") return { src: unsplash(this.take(hit).id, size.w, size.h), alt: hit.alt };
    if (want && /^https:\/\/(images\.unsplash\.com|picsum\.photos)\//.test(want) && keyForUrl(want)) return { src: want };
    const next = this.pool().find((s) => !this.used.has(s.key)) ?? this.pool()[0];
    return { src: unsplash(this.take(next).id, size.w, size.h), alt: next.alt };
  }
  portrait(want: string | undefined, size: Size, allowEmpty: boolean): string {
    if (allowEmpty && (!want || !want.trim())) return "";
    if (want && this.allowed.has(want.trim())) return want.trim();
    const hit = lookup(want);
    if (hit) return unsplash(this.take(hit).id, size.w, size.h);
    if (want && keyForUrl(want)) return want;
    if (allowEmpty) return "";
    const next = PORTRAITS.find((p) => !this.used.has(p.key)) ?? PORTRAITS[0];
    return unsplash(this.take(next).id, size.w, size.h);
  }
}

function lookup(want: string | undefined): CatalogImage | undefined {
  if (!want) return undefined;
  const k = want.trim().replace(/^img:/, "");
  return BY_KEY.get(k) ?? (keyForUrl(k) ? BY_KEY.get(keyForUrl(k)!) : undefined);
}
