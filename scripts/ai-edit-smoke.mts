// EDIT_MODEL=gemini-3.5-flash-lite LLM_CACHE_DIR=../work/llm-cache npx tsx scripts/ai-edit-smoke.mts site.json "instruction" [sectionId] [out.json]
import { readFileSync, writeFileSync } from "node:fs";
import { applyPatch } from "@/lib/jsonpatch";
import { editSite } from "@/lib/ai/edit";
const [file, instruction, sel, out] = process.argv.slice(2);
const site = JSON.parse(readFileSync(file, "utf8"));
const r = await editSite({ site, pageSlug: "home", instruction, selectedSectionId: sel || null });
console.log(JSON.stringify({ reply: r.data.reply, summary: r.data.summary, focus: r.data.focusId, model: r.model, ms: r.latencyMs, attempts: r.attempts, patchOps: r.data.patch.map((o) => `${o.op} ${o.path}`) }, null, 1));
if (out) writeFileSync(out, JSON.stringify(applyPatch(site, r.data.patch), null, 2));
