/**
 * Chat instruction → RFC 6902 JSON Patch against the site.
 *
 * The LLM answers with a small set of high-level operations (update props,
 * add/replace/remove/move a section, change theme…). We compile them here into
 * JSON Patch with correct array indexes, sanitising every value on the way, and
 * check the patched site still validates. The client applies the patch as one
 * undoable step.
 */
import { z } from "zod";
import { applyOperation, type Operation } from "@/lib/jsonpatch";
import { FONT_PAIRS, RADII, SECTION_TONES, STYLES, Site, siteSchemaPrompt, type SectionData, type SiteData } from "@/lib/schema";
import { imageCatalogPrompt, keyForUrl } from "@/lib/images";
import { generateJSON } from "@/lib/llm";
import { fixAnchors, normaliseType, pickerForSite, resolveImages, sanitizeProps, sanitizeSection, sanitizeTheme } from "./sanitize";

const SectionInput = z.object({ type: z.string(), props: z.record(z.unknown()).default({}), tone: z.string().optional(), id: z.string().optional() });

const Op = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("update_theme"),
    palette: z.record(z.string()).optional(),
    fontPair: z.enum(FONT_PAIRS).optional(),
    radius: z.enum(RADII).optional(),
    style: z.enum(STYLES).optional(),
  }),
  z.object({ op: z.literal("update_props"), sectionId: z.string(), props: z.record(z.unknown()) }),
  z.object({ op: z.literal("set_tone"), sectionId: z.string(), tone: z.enum(SECTION_TONES) }),
  z.object({ op: z.literal("replace_section"), sectionId: z.string(), section: SectionInput }),
  z.object({ op: z.literal("add_section"), afterSectionId: z.string().nullish(), section: SectionInput }),
  z.object({ op: z.literal("remove_section"), sectionId: z.string() }),
  z.object({ op: z.literal("move_section"), sectionId: z.string(), afterSectionId: z.string().nullish() }),
  z.object({ op: z.literal("rename_site"), name: z.string().min(1) }),
]);
export type EditOp = z.infer<typeof Op>;

const EditReply = z.object({
  reply: z.string().default("Done."),
  operations: z.array(Op).max(24).default([]),
});

export const EDIT_SYSTEM = `You are the AI editor inside DevCognix, a website builder. The user is editing a site and sends one instruction. Change ONLY what they ask, keep everything else, and answer with ONE JSON object (no markdown):

{ "reply": "<1–2 friendly sentences in the user's language saying what you changed, or asking a short question if the instruction is unclear>", "operations": [ ... ] }

Operations (applied in order):
- {"op":"update_props","sectionId":"<id>","props":{...}}  merge: each key you give replaces that prop entirely (send complete arrays, e.g. all testimonial items). Leave out keys you don't change.
- {"op":"replace_section","sectionId":"<id>","section":{"type":"<type>","props":{...},"tone"?:...}}  swap a section for a different type/layout (full props).
- {"op":"add_section","afterSectionId":"<id or null>","section":{"type":"<type>","props":{...full props...}}}  null = just before the footer.
- {"op":"remove_section","sectionId":"<id>"}
- {"op":"move_section","sectionId":"<id>","afterSectionId":"<id or null>"}  null = right after the navbar.
- {"op":"set_tone","sectionId":"<id>","tone":"auto|dark|light"}  recolour one section as a dark or light band (use for "make the hero darker", "dark footer"…).
- {"op":"update_theme","palette":{"primary":"#hex",...only keys that change},"fontPair"?,"radius"?,"style"?}  site-wide colours/fonts. When changing the main colour, also adjust accent/surface/border so they harmonise. Keep "text" and "muted" neutral (near-black/grey on light themes, near-white/grey on dark) unless the user asks to recolour text; text must stay readable (≥7:1).
- {"op":"rename_site","name":"..."}

Rules:
- "this", "here", "it" refer to the selected section when one is given.
- New or rewritten copy must be specific to the business, same voice, Indian context (₹, Indian names, +91) if the site is Indian. Fill every prop of new sections; never placeholders.
- Images: never invent URLs. Use "img:<key>" from the catalogue below (or keep the existing value). Testimonial avatar "" = initials. A URL the user pastes may be used as-is.
- New sections' in-page links use anchors: #features #pricing #process #testimonials #team #gallery #faq #contact. When you add a section worth navigating to, also update the navbar links.
- Don't create duplicates: if the page already has a section of the requested type (e.g. an FAQ), update that section instead of adding another, unless the user clearly asks for an additional one.
- Use the fewest operations that do the job. If nothing should change, return "operations": [].

Image catalogue:
${imageCatalogPrompt()}

Section schema:
${siteSchemaPrompt()}`;

/** Compact view of the page for the prompt: image URLs shortened to catalogue keys. */
function compactPage(site: SiteData, pageSlug: string) {
  const page = site.pages.find((p) => p.slug === pageSlug) ?? site.pages[0];
  const json = JSON.stringify(page.sections, (_k, v) => (typeof v === "string" && v.startsWith("https://images.unsplash.com/") && keyForUrl(v) ? `img:${keyForUrl(v)}` : v));
  return { page, json };
}

export function editUserPrompt(site: SiteData, pageSlug: string, instruction: string, selectedSectionId?: string | null, history: { role: string; text: string }[] = []) {
  const { page, json } = compactPage(site, pageSlug);
  const sel = selectedSectionId ? page.sections.find((s) => s.id === selectedSectionId) : null;
  const recent = history.slice(-4).map((h) => `${h.role}: ${h.text}`).join("\n");
  return [
    `Site name: ${site.name}`,
    `Description: ${site.description}`,
    `Theme: ${JSON.stringify(site.theme)}`,
    `Page "${page.slug}" sections (in order): ${json}`,
    sel ? `Selected section: ${sel.id} (${sel.type})` : "No section selected (instruction may be site-wide).",
    recent ? `Recent conversation:\n${recent}` : "",
    `Instruction: """${instruction.trim()}"""`,
  ].filter(Boolean).join("\n\n");
}

export type CompiledEdit = { reply: string; patch: Operation[]; focusId: string | null; summary: string[] };

class EditCompileError extends Error {}

/** Turn high-level ops into JSON Patch (validated against a working copy). */
export function compileEdit(site: SiteData, pageSlug: string, ops: EditOp[], instruction = ""): Omit<CompiledEdit, "reply"> {
  const working: SiteData = JSON.parse(JSON.stringify(site));
  const p = Math.max(0, working.pages.findIndex((x) => x.slug === pageSlug));
  const base = `/pages/${p}/sections`;
  const picker = pickerForSite(site);
  picker.allow(instruction.match(/https?:\/\/\S+/g) ?? []);
  const patch: Operation[] = [];
  const summary: string[] = [];
  let focusId: string | null = null;
  let navTouched = false;

  const secs = () => working.pages[p].sections;
  const idx = (id: string) => {
    const i = secs().findIndex((s) => s.id === id);
    if (i < 0) throw new EditCompileError(`Unknown sectionId "${id}". Valid ids: ${secs().map((s) => s.id).join(", ")}`);
    return i;
  };
  const emit = (op: Operation) => {
    applyOperation(working, op);
    patch.push(op);
  };
  const insertIndex = (afterId: string | null | undefined, fallback: "before-footer" | "after-navbar") => {
    if (afterId && secs().some((s) => s.id === afterId)) return idx(afterId) + 1;
    const arr = secs();
    if (fallback === "after-navbar") return arr[0]?.type === "navbar" ? 1 : 0;
    const f = arr.findIndex((s) => s.type === "footer");
    return f >= 0 ? f : arr.length;
  };

  for (const op of ops) {
    switch (op.op) {
      case "update_theme": {
        const cur = working.theme;
        const next = sanitizeTheme({ palette: { ...cur.palette, ...(op.palette ?? {}) }, fontPair: op.fontPair ?? cur.fontPair, radius: op.radius ?? cur.radius, style: op.style ?? cur.style }, cur);
        emit({ op: "replace", path: "/theme", value: next });
        summary.push("theme");
        break;
      }
      case "update_props": {
        const i = idx(op.sectionId);
        const s = secs()[i];
        const clean = sanitizeProps(s.type, op.props);
        resolveImages(s.type, clean, picker, false);
        for (const [k, v] of Object.entries(clean)) emit({ op: "add", path: `${base}/${i}/props/${k}`, value: v });
        if (s.type === "navbar") navTouched = true;
        focusId ??= s.id;
        summary.push(`edit ${s.id}`);
        break;
      }
      case "set_tone": {
        const i = idx(op.sectionId);
        if (op.tone === "auto") {
          if (secs()[i].tone) emit({ op: "remove", path: `${base}/${i}/tone` });
        } else emit({ op: "add", path: `${base}/${i}/tone`, value: op.tone });
        focusId ??= secs()[i].id;
        summary.push(`tone ${secs()[i].id}=${op.tone}`);
        break;
      }
      case "replace_section": {
        const i = idx(op.sectionId);
        const taken = new Set(secs().map((s) => s.id).filter((id) => id !== op.sectionId));
        const s = sanitizeSection({ ...op.section, id: op.sectionId }, taken, picker);
        if (!s) throw new EditCompileError(`Unknown section type "${op.section.type}".`);
        emit({ op: "replace", path: `${base}/${i}`, value: s });
        focusId = s.id;
        summary.push(`replace ${s.id}`);
        break;
      }
      case "add_section": {
        const type = normaliseType(op.section.type);
        if (!type) throw new EditCompileError(`Unknown section type "${op.section.type}".`);
        const taken = new Set(secs().map((s) => s.id));
        const s = sanitizeSection({ ...op.section, type, id: `${type}-1` }, taken, picker);
        if (!s) throw new EditCompileError(`Could not build section "${op.section.type}".`);
        const at = insertIndex(op.afterSectionId, "before-footer");
        emit({ op: "add", path: `${base}/${at}`, value: s });
        focusId = s.id;
        summary.push(`add ${s.id}`);
        break;
      }
      case "remove_section": {
        const i = idx(op.sectionId);
        if (secs().length <= 1) throw new EditCompileError("Can't remove the last section.");
        emit({ op: "remove", path: `${base}/${i}` });
        summary.push(`remove ${op.sectionId}`);
        break;
      }
      case "move_section": {
        const from = idx(op.sectionId);
        const moving = secs()[from];
        // RFC 6902 move = remove then add, so compute the target on the list without the item.
        const without = secs().filter((s) => s.id !== op.sectionId);
        let to: number;
        if (op.afterSectionId && without.some((s) => s.id === op.afterSectionId)) to = without.findIndex((s) => s.id === op.afterSectionId) + 1;
        else to = without[0]?.type === "navbar" ? 1 : 0;
        if (to !== from) emit({ op: "move", from: `${base}/${from}`, path: `${base}/${to}` });
        focusId ??= moving.id;
        summary.push(`move ${moving.id}`);
        break;
      }
      case "rename_site":
        emit({ op: "replace", path: "/name", value: op.name.slice(0, 80) });
        summary.push("rename");
        break;
    }
  }

  // Keep in-page links pointing at sections that exist after the edit.
  const before = JSON.stringify(secs());
  const fixed: SectionData[] = JSON.parse(before);
  fixAnchors(fixed);
  fixed.forEach((s, i) => {
    if (JSON.stringify(s.props) !== JSON.stringify(secs()[i].props)) emit({ op: "replace", path: `${base}/${i}/props`, value: s.props });
  });
  void navTouched;

  const check = Site.safeParse(working);
  if (!check.success) throw new EditCompileError("Edit produced an invalid site: " + check.error.issues.slice(0, 4).map((x) => `${x.path.join(".")}: ${x.message}`).join("; "));
  return { patch, focusId, summary };
}

export async function editSite(args: { site: SiteData; pageSlug: string; instruction: string; selectedSectionId?: string | null; history?: { role: string; text: string }[]; signal?: AbortSignal }) {
  const { site, pageSlug, instruction } = args;
  // Compile inside the schema so unknown ids etc. go through the repair round.
  const schema = EditReply.transform((r, ctx) => {
    try {
      return { reply: r.reply, ...compileEdit(site, pageSlug, r.operations, instruction) };
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: (e as Error).message });
      return z.NEVER;
    }
  });
  const res = await generateJSON({
    tier: "edit",
    system: EDIT_SYSTEM,
    user: editUserPrompt(site, pageSlug, instruction, args.selectedSectionId, args.history),
    schema,
    temperature: 0.5,
    maxOutputTokens: 16384,
    signal: args.signal,
  });
  return res;
}
