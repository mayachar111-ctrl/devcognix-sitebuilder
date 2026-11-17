"use client";
/**
 * Browser-side storage for AI-generated sites (Phase 2). Phase 3 moves this to
 * the Site table behind auth; the shapes are kept identical to make that easy.
 *  dc-sites:v1          → index of generated sites (newest first)
 *  dc-gen:v1:<id>       → the site exactly as generated (used by "Reset")
 *  dc-site:v1:<id>      → the working copy the editor saves (shared with templates)
 */
import { safeParseSite, type SiteData } from "@/lib/schema";

export type GeneratedMeta = { id: string; name: string; prompt: string; createdAt: number; model: string; latencyMs: number; primary: string; background: string };

const INDEX = "dc-sites:v1";
const genKey = (id: string) => `dc-gen:v1:${id}`;

export const isAiSiteId = (id: string) => id.startsWith("ai-");

export function newSiteId(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "site";
  return `ai-${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listGenerated(): GeneratedMeta[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX) ?? "[]");
  } catch {
    return [];
  }
}

export function saveGenerated(site: SiteData, info: { prompt: string; model: string; latencyMs: number }): string {
  const id = newSiteId(site.name);
  localStorage.setItem(genKey(id), JSON.stringify(site));
  const meta: GeneratedMeta = { id, name: site.name, prompt: info.prompt, createdAt: Date.now(), model: info.model, latencyMs: info.latencyMs, primary: site.theme.palette.primary, background: site.theme.palette.background };
  localStorage.setItem(INDEX, JSON.stringify([meta, ...listGenerated()].slice(0, 50)));
  return id;
}

export function loadGenerated(id: string): SiteData | null {
  try {
    const raw = localStorage.getItem(genKey(id));
    if (!raw) return null;
    const parsed = safeParseSite(JSON.parse(raw));
    return parsed.success ? (parsed.data as unknown as SiteData) : null;
  } catch {
    return null;
  }
}

export function deleteGenerated(id: string) {
  localStorage.removeItem(genKey(id));
  localStorage.removeItem(`dc-site:v1:${id}`);
  localStorage.removeItem(`dc-chat:v1:${id}`);
  localStorage.setItem(INDEX, JSON.stringify(listGenerated().filter((m) => m.id !== id)));
}
