// Phase 2 end-to-end run: generate two sites from the dashboard, do AI chat edits,
// test undo/redo, and capture screenshots.
// Usage (app running): node scripts/phase2-e2e.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { startRelay } from "./relay.mjs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? path.resolve("../screenshots/phase2");
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  { slug: "yoga-mangaluru", prompt: "A yoga studio in Mangaluru with class schedule and pricing" },
  { slug: "ca-firm-bengaluru", prompt: "A CA firm in Bengaluru offering GST filing" },
];
// Edits run on the second site; the last one is what the editor screenshot shows.
const EDITS = (process.env.EDITS ? JSON.parse(process.env.EDITS) : [
  { text: "Change the colours to green" },
  { text: "Add an FAQ section about GST filing deadlines and documents needed" },
  { select: "Testimonials", text: "Rewrite these testimonials as if the firm's clients were dentists and dental clinics" },
  { text: "Make the hero darker" },
]);

const report = { base: BASE, generations: [], edits: [], undo: null, credits: null, shots: [], errors: [] };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function settle(page) {
  await page.bringToFront();
  await page.waitForSelector(".dc-site", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
  });
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 20000 }).catch(() => {});
  // Let scroll-reveal animations finish (elements that were scrolled past but are still fading in).
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('.dc-site [style*="opacity"]')).some((e) => e.offsetParent && parseFloat(e.style.opacity) < 1), null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
}
const broken = (page) => page.evaluate(() => Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(0, 100)));

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, ...opts });
  const b = await broken(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  report.shots.push({ name, file, broken: b, horizontalOverflowPx: overflow });
  log("shot", name, b.length ? `broken=${b.length}` : "");
}

const relay = await startRelay();
const browser = await chromium.launch(relay ? { proxy: { server: `http://127.0.0.1:${relay.address().port}`, bypass: "<-loopback>" } } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on("pageerror", (e) => report.errors.push(e.message.slice(0, 200)));
page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && report.errors.push(m.text().slice(0, 200)));

try {
  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(1500);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });

  const ids = [];
  for (const [i, s] of SITES.entries()) {
    await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(1500);
    const box = page.getByLabel("Describe your business");
    await box.fill(s.prompt);
    if (i === 0) {
      await page.waitForTimeout(600);
      await shot(page, "01-dashboard-prompt");
    }
    // When the response comes from the dev cache it is instant, so hold it briefly
    // (first site only) to be able to capture the generating state.
    if (i === 0 && process.env.HOLD_GENERATE !== "0") await page.route("**/api/generate", async (r) => { await new Promise((ok) => setTimeout(ok, 9000)); await r.continue(); });
    const t0 = Date.now();
    await page.getByRole("button", { name: /Generate/ }).click();
    if (i === 0) {
      await page.waitForTimeout(6500);
      await shot(page, "02-dashboard-generating", { clip: { x: 0, y: 0, width: 1440, height: 640 } });
    }
    const outcome = await Promise.race([
      page.waitForURL(/\/editor\/ai-/, { timeout: 240000 }).then(() => "ok"),
      page.getByTestId("generate-error").waitFor({ timeout: 240000 }).then(async () => "error: " + (await page.getByTestId("generate-error").innerText())),
    ]);
    const ms = Date.now() - t0;
    log("generate", s.slug, outcome, ms + "ms");
    if (outcome !== "ok") {
      report.generations.push({ prompt: s.prompt, outcome, uiMs: ms });
      continue;
    }
    const id = page.url().split("/editor/")[1];
    ids.push(id);
    await page.unroute("**/api/generate").catch(() => {});
    await page.getByTestId("ai-chat").waitFor();
    if (i === 0) {
      await page.waitForTimeout(2500);
      await shot(page, "02b-editor-new-site");
    }
    const meta = await page.evaluate((id) => JSON.parse(localStorage.getItem("dc-sites:v1") ?? "[]").find((m) => m.id === id), id);
    const site = await page.evaluate((id) => JSON.parse(localStorage.getItem(`dc-gen:v1:${id}`)), id);
    report.generations.push({ prompt: s.prompt, outcome, id, uiMs: ms, serverMs: meta?.latencyMs, model: meta?.model, name: site?.name, sections: site?.pages?.[0]?.sections?.map((x) => x.type), theme: site?.theme });
    fs.writeFileSync(path.join(OUT, `${String(3 + i).padStart(2, "0")}-site-${s.slug}.json`), JSON.stringify(site, null, 2));

    const pv = await ctx.newPage();
    await pv.goto(`${BASE}/preview/${id}?local=1`, { waitUntil: "domcontentloaded" });
    await settle(pv);
    await shot(pv, `${String(3 + i).padStart(2, "0")}-site-${s.slug}`, { fullPage: true });
    await pv.close();
  }

  if (ids[0]) {
    const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const state = await page.evaluate(() => JSON.stringify(localStorage));
    const mp = await mob.newPage();
    await mp.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await mp.evaluate((s) => Object.entries(JSON.parse(s)).forEach(([k, v]) => localStorage.setItem(k, v)), state);
    await mp.goto(`${BASE}/preview/${ids[0]}?local=1`, { waitUntil: "domcontentloaded" });
    await settle(mp);
    await shot(mp, `05-site-${SITES[0].slug}-mobile`, { fullPage: true });
    await mob.close();
  }

  const target = ids[1] ?? ids[0];
  if (target) {
    await page.goto(`${BASE}/editor/${target}`, { waitUntil: "load" });
    await page.getByTestId("ai-chat").waitFor();
    await page.waitForTimeout(800);
    const bubbles = page.getByTestId("ai-chat-log").locator('[data-msg="assistant"]');
    for (const e of EDITS) {
      if (e.select) await page.locator("aside").first().getByText(e.select, { exact: true }).first().click();
      else await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      const before = await bubbles.count();
      const t0 = Date.now();
      await page.getByLabel("Describe a change").fill(e.text);
      await page.getByLabel("Describe a change").press("Enter");
      await bubbles.nth(before).waitFor({ timeout: 150000 });
      const ms = Date.now() - t0;
      const reply = await bubbles.nth(before).innerText();
      log("edit", JSON.stringify(e.text), ms + "ms", reply.replace(/\s+/g, " ").slice(0, 120));
      report.edits.push({ instruction: e.text, selected: e.select ?? null, uiMs: ms, reply: reply.replace(/\s+/g, " ").trim() });
      await page.waitForTimeout(900);
    }
    await page.waitForTimeout(1200);
    await shot(page, "06-editor-chat-edit");

    // Undo the last AI edit (hero darker) via the chat Undo button, then redo with the keyboard.
    const darkCount = () => page.locator('[data-section-id] .dc-tone[data-tone="dark"]').count();
    const themeNow = () => page.evaluate((id) => JSON.parse(localStorage.getItem(`dc-site:v1:${id}`) ?? "{}")?.pages?.[0]?.sections?.map((s) => s.tone ?? "").join(","), target);
    const beforeUndo = await darkCount();
    const undoBtn = page.getByRole("button", { name: "↶ Undo" });
    if (await undoBtn.count()) {
      await undoBtn.click();
      await page.waitForTimeout(800);
      const afterUndo = await darkCount();
      await page.locator("main").click({ position: { x: 5, y: 5 } });
      await page.keyboard.press("Control+Shift+Z");
      await page.waitForTimeout(800);
      const afterRedo = await darkCount();
      report.undo = { darkSectionsBefore: beforeUndo, afterUndo, afterRedo, tones: await themeNow() };
      log("undo", JSON.stringify(report.undo));
    }
    await page.waitForTimeout(800);

    const pv = await ctx.newPage();
    await pv.goto(`${BASE}/preview/${target}?local=1`, { waitUntil: "domcontentloaded" });
    await settle(pv);
    await shot(pv, "07-site-after-chat-edits", { fullPage: true });
    await pv.close();
  }

  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(1500);
  await page.waitForTimeout(1500);
  report.credits = await page.getByTestId("credits").first().innerText();
  await shot(page, "08-dashboard-my-sites");
} catch (e) {
  report.errors.push("FATAL " + e.message.slice(0, 300));
  await page.screenshot({ path: path.join(OUT, "zz-failure.png") }).catch(() => {});
}
await browser.close();
relay?.close();
fs.writeFileSync(path.join(OUT, "e2e-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
