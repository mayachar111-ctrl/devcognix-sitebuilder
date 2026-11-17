// Dev smoke test for the generator without the web server.
// GENERATE_MODEL=gemini-3.5-flash-lite LLM_CACHE_DIR=../work/llm-cache npx tsx scripts/ai-smoke.mts "brief" out.json
import { writeFileSync } from "node:fs";
import { generateSite } from "@/lib/ai/generate";
const brief = process.argv[2] ?? "A yoga studio in Mangaluru with class schedule and pricing";
const out = process.argv[3] ?? "../work/smoke-site.json";
const r = await generateSite(brief);
writeFileSync(out, JSON.stringify(r.data, null, 2));
console.log(JSON.stringify({ model: r.model, latencyMs: r.latencyMs, attempts: r.attempts, cached: r.cached, usage: r.usage, sections: r.data.pages[0].sections.map((s) => s.type) }));
