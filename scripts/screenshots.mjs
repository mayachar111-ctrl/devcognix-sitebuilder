// Usage: start the app (npm run start or npm run dev), then: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { startRelay } from "./relay.mjs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? path.resolve("../screenshots/phase1");
const ONLY = process.env.ONLY?.split(",");
fs.mkdirSync(OUT, { recursive: true });

async function settle(page, { scroll = true } = {}) {
  await page.waitForLoadState("networkidle").catch(() => {});
  if (scroll) {
    // Walk the page so whileInView animations and lazy images fire.
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 400));
    });
  }
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1800);
}

async function brokenImages(page) {
  return page.evaluate(() => Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(0, 120)));
}

const shots = [
  { name: "01-dashboard", url: "/", full: false, iframes: true, height: 1820 }, // iframes don't paint reliably in fullPage captures
  { name: "02-preview-saas-ledgerline", url: "/preview/saas-ledgerline", full: true },
  { name: "03-preview-clinic-aarogya", url: "/preview/clinic-aarogya", full: true },
  { name: "04-preview-cafe-kaapi-crumb", url: "/preview/cafe-kaapi-crumb", full: true },
  { name: "05-preview-agency-northbeam", url: "/preview/agency-northbeam", full: true },
  { name: "06-editor-section-selected", url: "/editor/clinic-aarogya", editor: "pricing-1" },
  { name: "07-editor-theme-panel", url: "/editor/saas-ledgerline", editor: null },
  { name: "08-preview-clinic-mobile", url: "/preview/clinic-aarogya", full: true, mobile: true },
];

const relay = await startRelay();
const browser = await chromium.launch(relay ? { proxy: { server: `http://127.0.0.1:${relay.address().port}`, bypass: "<-loopback>" } } : {});
const report = [];
for (const s of shots) {
  if (ONLY && !ONLY.includes(s.name)) continue;
  const ctx = await browser.newContext({
    viewport: s.mobile ? { width: 390, height: 844 } : { width: 1440, height: s.height ?? 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + s.url, { waitUntil: "domcontentloaded" });
  if (s.editor !== undefined) {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    if (s.editor) {
      const target = page.locator(`[data-section-id="${s.editor}"]`);
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await target.click({ position: { x: 40, y: 60 } });
      await page.waitForTimeout(600);
      // Expand the first plan in the props form to show nested editing.
      const plans = page.locator("aside >> text=Consultation").first();
      if (await plans.count()) await plans.click();
      await page.waitForTimeout(400);
      await page.locator(`[data-section-id="${s.editor}"]`).scrollIntoViewIfNeeded();
    } else {
      await page.locator("main").evaluate(async (el) => {
        for (let y = 0; y < el.scrollHeight; y += 400) { el.scrollTop = y; await new Promise((r) => setTimeout(r, 80)); }
        el.scrollTop = 0;
      });
    }
    await page.waitForTimeout(1800);
  } else {
    await settle(page);
    if (s.iframes) await page.waitForTimeout(7000);
  }
  const file = path.join(OUT, `${s.name}.png`);
  await page.screenshot({ path: file, fullPage: !!s.full });
  const broken = await brokenImages(page);
  const pending = await page.evaluate(() => Array.from(document.images).filter((i) => !i.complete).map((i) => i.src.slice(0, 120)));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  report.push({ shot: s.name, file, broken, pending, horizontalOverflowPx: overflow, errors: errors.slice(0, 5) });
  await ctx.close();
}
await browser.close();
relay?.close();
console.log(JSON.stringify(report, null, 2));
