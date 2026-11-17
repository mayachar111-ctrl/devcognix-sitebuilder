import { parseSite, type SiteData } from "@/lib/schema";
import saas from "./saas-ledgerline.json";
import cafe from "./cafe-kaapi-crumb.json";
import agency from "./agency-northbeam.json";
import clinic from "./clinic-aarogya.json";

export type TemplateMeta = { id: string; name: string; category: string; blurb: string; site: SiteData };

// Validated at import time: a malformed template fails the build, not the user.
export const TEMPLATES: TemplateMeta[] = [
  { id: "saas-ledgerline", name: "Ledgerline", category: "SaaS startup", blurb: "Gradient hero, pricing in ₹, product tour and a blog page.", site: parseSite(saas) },
  { id: "cafe-kaapi-crumb", name: "Kaapi & Crumb", category: "Restaurant / café", blurb: "Warm editorial look with menu highlights, gallery and table requests.", site: parseSite(cafe) },
  { id: "agency-northbeam", name: "Northbeam Studio", category: "Agency / portfolio", blurb: "Dark glass aesthetic, selected work, process timeline and team.", site: parseSite(agency) },
  { id: "clinic-aarogya", name: "Aarogya Physio", category: "Local service · India", blurb: "Clinic site with treatments, doctors, fee cards and appointment form.", site: parseSite(clinic) },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
