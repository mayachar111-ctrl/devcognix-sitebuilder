import { NextResponse } from "next/server";
import { siteJsonSchema, siteSchemaPrompt, SECTION_TYPES } from "@/lib/schema";

export const dynamic = "force-static";

/** GET /api/schema → JSON Schema + compact prompt string, for wiring up the Phase 2 generator. */
export function GET() {
  return NextResponse.json({ sectionTypes: SECTION_TYPES, prompt: siteSchemaPrompt(), jsonSchema: siteJsonSchema() });
}
