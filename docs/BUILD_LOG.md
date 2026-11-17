# DevCognix AI Website Builder — Build Log

## Phase 1 — Template engine, renderer, editor shell (16 Nov 2026)

**Status:** done. `npm run build` passes (typecheck included), `npm run dev` serves every route, and an automated Playwright run tested the editor (edit, add, undo, saving to localStorage, local preview, page switching). There were no runtime errors, no broken images and no horizontal overflow on any screenshot.

All code, templates, copy and icons are written from scratch. Nothing comes from Webild or any other builder.

### Stack
- Next.js 14.2.35 (App Router), React 18.3, TypeScript (strict), Tailwind 3.4, Framer Motion 11
- zod 3 + zod-to-json-schema for the site schema
- Prisma 5.22: SQLite in dev (`prisma/dev.db`), schema kept Postgres-compatible
- Playwright 1.48 (dev only) for screenshots
- Next 14 was chosen over 15 because 15 needs the React 19 RC, which Framer Motion 11 rejects as a peer dependency. 14.2.35 is the patched 14.x release.

### How to run
```bash
cd app
npm install
npx prisma db push        # creates prisma/dev.db (SQLite)
npm run dev               # http://localhost:3000
npm run build && npm start
# screenshots (app must be running on :3000)
npx playwright install chromium   # once
node scripts/screenshots.mjs      # → ../screenshots/phase1/*.png
```

Routes:
- `/`: dashboard with live iframe thumbnails of the 4 templates and a disabled "describe your business" prompt box
- `/preview/[templateId]`: full-site render. `?page=blog` switches page. `?local=1` shows the copy the editor saved.
- `/editor/[templateId]`: editor shell
- `/api/schema`: JSON Schema, compact prompt string and the list of section types (for Phase 2)

### What's built
1. **Site schema** in `app/lib/schema.ts`
   - `Site { name, description, theme { palette(7 hex), fontPair, radius, style }, pages[{ slug, title, sections[{ id, type, props }] }] }`
   - One zod props schema per section type, every field `.describe()`d. Sections form a discriminated union on `type`.
   - Section `props` are **partial** at site level, and anything missing is filled from `lib/defaults.ts`. This keeps LLM output short and forgiving.
   - `parseSite`/`safeParseSite`, `siteJsonSchema()` (draft-07, no $refs, about 23 KB) and `siteSchemaPrompt()`, a compact description of about 3 KB for prompts.
2. **Theme system** in `app/lib/theme.ts` and `globals.css`
   - The palette becomes CSS variables as RGB triplets, so Tailwind opacity modifiers work (`bg-primary/10`).
   - `primary-fg`/`accent-fg` are picked automatically for contrast.
   - 6 font pairs (one Google Fonts stylesheet), 5 radius steps, and 4 card styles (`minimal`, `soft`, `bold`, `glass`) switched with `[data-style]` CSS.
   - The theme panel shows a contrast check.
3. **20 section components** in `app/components/sections/`. All are responsive, themed and animated with Framer Motion (scroll reveals, staggered children, hover lifts):
   - `navbar`: sticky, blurs on scroll, animated mobile menu
   - `hero-centered`: grid glow background, image tilts into place on scroll
   - `hero-split`: text plus photo, floating badge, image on either side
   - `hero-gradient`: drifting colour blobs, headline revealed word by word, animated gradient highlight
   - `logo-strip`: wordmark row or marquee
   - `features-grid`: 2/3/4 columns, icon cards
   - `feature-rows`: alternating image and text rows
   - `stats`: count-up numbers, optional tinted band
   - `testimonials`: star ratings, avatar or initials
   - `pricing`: monthly/yearly toggle with animated price change, highlighted plan, ₹ formatting in en-IN
   - `faq`: animated accordion
   - `cta-banner`: gradient, solid or outline
   - `gallery`: masonry or grid, with lightbox
   - `team`: bio slides up on hover
   - `process`: timeline line draws in as you scroll
   - `contact`: form with optional service select and success state, plus contact details
   - `newsletter`
   - `blog-cards`
   - `video`: poster image, click loads a privacy-mode embed
   - `footer`: columns, social icons
   - Shared parts: `SmartImage` (shows an inline SVG placeholder when an image URL fails or is empty, so images never break), an original hand-drawn icon set (24 content icons and 7 social icons), and `Reveal`/`Stagger` motion helpers.
4. **Renderer** in `app/components/renderer/SiteRenderer.tsx`
   - Applies the theme variables, picks the page and merges defaults.
   - Each section has its own error boundary, so a bad section shows an inline error instead of crashing the whole site.
   - In editor mode, sections can be selected (hover outline, selected outline with a label) and link navigation is blocked.
5. **4 starter templates** (JSON in `app/lib/templates/`, validated when imported, so a broken template fails the build):
   - `saas-ledgerline`: GST invoicing SaaS, geometric font / soft style. Has 2 pages (home + blog) to exercise multi-page support.
   - `cafe-kaapi-crumb`: Bengaluru café, editorial font / minimal style
   - `agency-northbeam`: dark design studio, glass style, lime/violet
   - `clinic-aarogya`: Pune physiotherapy clinic. Prices in ₹ per visit, appointment form, WhatsApp link.
   - The JSON is generated by `app/scripts/make-templates.py`, which is the source for edits. Every Unsplash ID was checked to return HTTP 200 and looked at on a contact sheet to confirm it suits its spot.
6. **Editor** at `/editor/[id]`:
   - **Left panel:** section list with drag reorder (Framer `Reorder`), move up/down and delete, plus an "Add section" library (20 types in categories; new sections go after the selected one, otherwise before the footer). Below it sits a disabled AI chat box marked "Coming in Phase 2".
   - **Centre:** the site rendered at 1280px and zoomed to fit (CSS `zoom`). Click any section to select it, click the background or press Esc to deselect.
   - **Right panel:** a props form built automatically from each section's zod schema: text, textarea, number, toggle, select, icon picker, link pair, image with thumbnail, and repeatable lists with add/remove/reorder. New section types get an editor without extra code. The Theme tab has presets, a picker for each of the 7 colours, a contrast warning, fonts, radius and card style.
   - **Top bar:** rename the site, switch page, undo/redo (⌘Z / ⇧⌘Z, with keystrokes grouped), reset to the template, preview in a new tab (shows the saved copy), and a disabled Publish button.
   - Changes save to localStorage under `dc-site:v1:<templateId>`, about 400 ms after the last edit.
7. **Prisma models** (`app/prisma/schema.prisma`): `User` (plan, region), `Site` (stores the site JSON, status, publishedAt), `CreditLedger` (delta, reason, siteId, meta). These are stubs; nothing reads or writes them yet.

### Screenshots (`screenshots/phase1/`)
| File | What |
|---|---|
| `01-dashboard.png` | Dashboard with live template thumbnails (1440×1820 viewport) |
| `02-preview-saas-ledgerline.png` | SaaS template, desktop full page |
| `03-preview-clinic-aarogya.png` | Clinic template, desktop full page |
| `04-preview-cafe-kaapi-crumb.png` | Café template, desktop full page |
| `05-preview-agency-northbeam.png` | Agency template, desktop full page |
| `06-editor-section-selected.png` | Editor with Pricing selected on the canvas and its props form open, nested plan expanded |
| `07-editor-theme-panel.png` | Editor Theme tab (multi-page switcher visible) |
| `08-preview-clinic-mobile.png` | Clinic template at 390px |

Visual fixes made after reviewing the screenshots:
- Process timeline steps all sat on the left. Fixed so they alternate sides.
- CSS-column masonry left blank spaces in the gallery (Chromium paint bug with animated children). Replaced with flex-column masonry.
- The solid CTA banner had a white button on a light band. Variants reworked.
- The testimonial columns came out unbalanced. Switched to a grid.
- The LinkedIn and duplicate icons rendered badly. Redrawn as SVG.
- Dashboard thumbnails stayed on the loading shimmer when the iframe loaded before hydration. Fixed.
- Added a favicon.

### Decisions
- **JSON-first.** The site JSON is the only source of truth. The editor, renderer, the AI (Phase 2) and storage all read and write the same object, and AI edits will be JSON patches against it.
- **Props are partial and defaults merge at render.** LLMs can leave fields out, and adding a field to a section later never breaks saved sites.
- **The form is built from the schema**, so it can't drift from the schema.
- **CSS-variable theming.** One component set covers every brand. A theme change is instant, needs no rebuild, and works the same for exported static HTML later.
- **Plain `<img>` plus SmartImage instead of `next/image`.** User and AI image URLs come from any domain, and the placeholder fallback means images never break.
- **Google Fonts via one `<link>`** (6 pairs), not `next/font`, so the font pair can change at runtime.
- **SQLite in dev.** Postgres-compatible means: no enums (plain strings) and the site JSON stored as `String`. To move, switch `provider` to `postgresql` and change `Site.data` and `CreditLedger.meta` to `Json`.

### Known gaps / caveats
- **No device preview toggle in the editor.** The canvas is desktop-only (zoomed 1280px). True tablet and mobile previews need an iframe canvas, because media queries follow the real viewport. Mobile rendering itself was checked in `08-…mobile.png`.
- No auth, no saving to the database, no publishing or hosting, and nothing yet reads or writes the Prisma models.
- Forms (contact, newsletter) only show a success state; nothing is stored or emailed yet.
- Image fields take URLs only; there is no upload or media library.
- No inline text editing on the canvas yet; editing happens in the right panel.
- Some motion detail is lost in the zoomed editor (scroll-linked hero tilt). Works fine in preview.
- No ESLint config (`eslint.ignoreDuringBuilds: true`). TypeScript strict checking still runs during the build.
- The demo video embed is a stock Big Buck Bunny ID; swap it per site.
- Next 14 is an older major version. Plan an upgrade to Next 15+/React 19 together with Framer Motion 12 (or `motion`).
- Sandbox note: `scripts/screenshots.mjs` contains a small local relay so Chromium can get through an authenticated HTTP proxy (it reads `HTTPS_PROXY` and never logs it). On a normal machine it is inactive.

### Next: Phase 2 (LLM generation)
1. `POST /api/generate`: business brief (name, type, city, tone, services) → LLM with `siteSchemaPrompt()` plus 1–2 template examples as few-shot → validate with `safeParseSite` → repair loop (send zod errors back once) → save.
   - Use structured output / tool calling with `siteJsonSchema()` where the provider supports it.
2. **Image step:** the LLM writes image *queries*, and a server step turns them into Unsplash/Pexels API URLs (needs an API key), so photos don't come from guessed IDs.
3. **AI edits in the editor chat:** send the selected section plus the instruction and get a JSON patch back (RFC 6902 or a whole-section replace) → validate → apply with undo. Also site-wide commands ("make it darker", "add pricing").
4. **Credits:** deduct per generate/edit into `CreditLedger` (cost per credit from the unit-economics sheet). Needs auth (Phase 3), so stub a single dev user first.
5. **Needed from the user:** an LLM API key (Anthropic/OpenAI), optionally an Unsplash API key, and later Razorpay test keys (Phase 3 billing).

Phase 3 after that: auth, database-backed sites, publish to subdomain/static export, iframe device preview, form submissions, Razorpay.

## Decision 2026-11-17
User chose a free LLM API first: Google Gemini free tier (gemini-3.8-flash for generation ~20/day, gemini-3.5-flash-lite for edits ~500/day). LLM layer must be provider-agnostic so Claude can be switched in later. Waiting for user to save Gemini key via secure form.

## Phase 2: AI generation and AI chat edits (17 Nov 2026)

**Status:** done and tested end to end against the real Gemini API. `npm run build` passes (typecheck included). One honest caveat: Google returned **503 "high demand"** on every `gemini-3.8-flash` attempt today, so the showcase sites came from the fallback models (details below). The code path for 3.8-flash is the same; only the model id changes.

### What works
1. **Provider-agnostic LLM layer** (`app/lib/llm/`)
   - `generateJSON({ system, user, schema (zod), tier: 'generate' | 'edit' })` → `{ data, model, latencyMs, attempts, cached, usage }`.
   - `LLM_PROVIDER=gemini` (default) or `anthropic`. The Anthropic provider is a **stub**: it is written (Messages API with a forced `emit_json` tool) but has never been called, since there is no key. Its model ids come from env (`ANTHROPIC_GENERATE_MODEL` / `ANTHROPIC_EDIT_MODEL`, defaults `claude-sonnet-5-5` / `claude-haiku-5-5`). Check the exact ids when a key arrives.
   - Gemini REST v1beta `generateContent` with header `x-goog-api-key`, `responseMimeType: application/json`, and `thinkingLevel: low`. Unsupported options (schema, thinking) are dropped automatically on a 400.
   - **Proxy:** Node's fetch ignores `HTTPS_PROXY`, so when it is set the provider uses `undici.fetch` + `EnvHttpProxyAgent` (marked as a server external package in `next.config.mjs`). Keys and proxy URLs are never logged. Log lines show only model, outcome, ms and token counts.
   - **Structured output:** Gemini rejects our full Site JSON Schema ("too many states for serving", even with descriptions and limits stripped). A skeleton schema with free-form `props` makes the model return *empty* props. So we use JSON mode, the compact `siteSchemaPrompt()`, then zod validation. `jsonSchema` stays in the interface for providers that can use it.
   - **Validation and repair:** output is parsed and run through zod. A *sanitiser* fixes most problems without spending another call (`lib/ai/sanitize.ts`): it coerces each prop against its zod schema, drops unknown keys, trims arrays to their max, clamps numbers, maps type aliases (`hero` → `hero-split`), dedupes ids, keeps navbar first and footer last, fixes text contrast, turns `INR` into `₹`, and points nav links at anchors that exist. If the result still fails, **one repair call** is made with the zod errors.
   - **Fallbacks:** each tier has a chain. Generate: `GENERATE_MODEL` (default `gemini-3.8-flash`) → `gemini-3.6-flash` → `gemini-3.5-flash-lite`. Edit: `EDIT_MODEL` (default `gemini-3.5-flash-lite`) → `gemini-3.1-flash-lite` → `gemini-flash-lite-latest`. All are overridable with `*_FALLBACK_MODELS`.
     - On 429, 503 or timeout the next model is tried. A quick 503 gets one retry on the same model after 3 s; a slow one goes straight to the next model.
     - Each attempt has its own timeout: generate 120 s, edit 60 s, `LLM_TIMEOUT_MS` overrides both.
     - A daily quota 429 becomes the user-facing message: "The daily free AI limit has been reached. It resets tomorrow…"
     - Every other error is mapped to a friendly message in `lib/llm/types.ts`.
   - **Dev cache:** set `LLM_CACHE_DIR` and responses are saved to disk, keyed by provider, tier, model chain and prompt. Re-running tests then costs no quota. `.env.local` in the sandbox points it at `../work/llm-cache`. **Leave it unset in production.**
2. **Generation:** `POST /api/generate {prompt}` → `{ site, meta { model, latencyMs, attempts, usage, cost: 10 } }` (`lib/ai/generate.ts`).
   - The system prompt asks for 7–10 sections chosen for the business, real copy throughout, and Indian context when it applies (₹ numbers, Indian names, local areas, +91 numbers, GST/UPI/WhatsApp).
   - Class schedules are shown as a features-grid, since there is no timetable section.
   - The model also picks a theme, nav anchors and item counts that fill the grid.
   - **Images:** the model never writes URLs. It picks keys (`img:yoga-3`) from a curated catalogue of **88 scene photos in 24 categories plus 13 portraits** (`lib/images.ts`). Every Unsplash ID was checked to return HTTP 200 and reviewed on a contact sheet. The server resolves keys to URLs sized for the slot (hero, row, gallery, avatar…), avoids repeats, and fills missing images from the site's industry category. Testimonials default to initials, not stock faces.
3. **Dashboard:** the prompt box is live.
   - Example chips, ⌘/Ctrl+Enter to send, a "10 credits" label, an animated generating state with step text, a progress bar, elapsed seconds and Cancel, and inline errors (amber).
   - On success the site is saved to localStorage and the editor opens on `/editor/ai-<slug>-<rand>`.
   - New "Your AI sites" list (open, preview, delete) and a credits pill in the header.
   - Storage keys (`lib/localSites.ts`): `dc-sites:v1` is the index, `dc-gen:v1:<id>` is the original (used by Reset), `dc-site:v1:<id>` is the working copy.
   - `/editor/[id]` and `/preview/[id]?local=1` load `ai-*` ids on the client.
4. **AI chat edits:** `POST /api/edit {site, pageSlug, instruction, selectedSectionId?, history?}` → `{ reply, patch (RFC 6902), focusId, summary, meta { cost } }` (`lib/ai/edit.ts`).
   - The model returns high-level ops: `update_props`, `replace_section`, `add_section`, `remove_section`, `move_section`, `set_tone`, `update_theme`, `rename_site`.
   - The server compiles them into **RFC 6902 JSON Patch** with correct array indexes, sanitises every value (images, coercion, anchors), and checks that the patched site validates.
   - An unknown section id or a bad result goes back through the repair round.
   - Prompt rules: change only what was asked, "this" means the selected section, update an existing FAQ or pricing section instead of duplicating it, and keep text colours neutral when recolouring.
   - The client applies the patch with a small dependency-free implementation (`lib/jsonpatch.ts`) as **one undoable step** (`store.applyPatch`). The chat shows the reply, the latency and "Applied · −1 credit", plus an **Undo** button on the latest change; ⌘Z/⇧⌘Z work too.
   - Chat history is kept per site in localStorage. There are suggestion chips for the whole site and for the selected section.
   - **New schema feature:** an optional section-level `tone: auto | dark | light`. The renderer recolours just that band with CSS variables and lifts brand colours that would disappear on it. It is used for "make the hero darker" and is also exposed in the inspector as "Section colours".
5. **Credits placeholder:** `lib/credits.ts` (generate 10, edit 1, 100 demo credits).
   - The wallet lives in localStorage (`components/ai/useCredits.tsx`) and is synced across tabs. Credits are only spent on success (an edit that changes nothing is free).
   - Every spend is also logged locally as `{delta, reason, siteId, at}`, the same shape as `CreditLedger`, so Phase 3 can replay it.
   - Clicking the pill when the balance is below 20 tops it back up to 100.
6. Smaller changes:
   - Sections render with an anchor wrapper, so `#<section-id>` links scroll.
   - Testimonials, team and blog grids centre themselves when there are 2–4 items.
   - `scripts/relay.mjs` was split out of the screenshot script and hardened (it no longer crashes on ECONNRESET).

### Test run (real API, 17 Nov 2026), `node scripts/phase2-e2e.mjs`
| Prompt | Model that answered | Server latency | Result |
|---|---|---|---|
| "A yoga studio in Mangaluru with class schedule and pricing" | gemini-3.6-flash (after 3.8-flash 503 ×2, one hanging 120 s, then 3.6 503 ×1) | **38.7 s** for the successful call; 287 s end to end | "Prana Veda Yoga Studio": 10 sections, Kadri location, 6 class slots with IST times, ₹350/class · ₹2,499/month · ₹3,999 plans, gallery, FAQ, contact |
| "A CA firm in Bengaluru offering GST filing" | gemini-3.5-flash-lite (after 3.6-flash 503 ×2) | **14.2 s** for the successful call; 17.4 s end to end | "Aura & Co. Chartered Accountants": 11 sections, GSTR-1/3B services, ₹1,499/₹3,999/₹8,999 plans, CA team, Koramangala/Indiranagar copy |

Earlier development runs on flash-lite (3.5/3.1) took 13–30 s per site, about 3.3k input and 2.2–3.6k output tokens.

Chat edits on the CA site (gemini-3.5-flash-lite, 1.2–7.5 s each, about 5.3k input tokens):
1. "Change the colours to green" → `update_theme`, applied.
2. "Add an FAQ section about GST filing deadlines…" → the model saw the existing FAQ and **updated** it instead of adding a duplicate.
3. With Testimonials selected, "Rewrite these testimonials as if the firm's clients were dentists…" → new quotes from Dr-named clinic owners.
4. "Make the hero darker" → `set_tone dark` on the hero.

Undo/redo was checked: dark sections went 1 → 0 after Undo and back to 1 after ⇧⌘Z. Credits went 100 → 76 (2 generations + 4 edits). No console errors, no broken images and no horizontal overflow on any screenshot.

Free quota used today: 8 `gemini-3.8-flash` attempts (all 503, so probably not counted) and about 6 `gemini-3.6-flash` attempts. Everything else ran on flash-lite.

### Screenshots (`screenshots/phase2/`)
| File | What |
|---|---|
| `01-dashboard-prompt.png` | Dashboard with the prompt typed, example chips and credits |
| `02-dashboard-generating.png` | Generating state. The response came from the dev cache, so the e2e script holds it for 9 s to capture this. |
| `02b-editor-new-site.png` | Editor right after generation (AI generated · model shown) |
| `03-site-yoga-mangaluru.png` (+ `.json`) | Generated yoga site, desktop full page |
| `04-site-ca-firm-bengaluru.png` (+ `.json`) | Generated CA firm site, desktop full page |
| `05-site-yoga-mangaluru-mobile.png` | Yoga site at 390 px |
| `06-editor-chat-edit.png` | Editor after 4 chat edits: green theme, dark hero selected, chat log with Undo |
| `07-site-after-chat-edits.png` | CA site after the edits, full page |
| `08-dashboard-my-sites.png` | Dashboard with "Your AI sites" and 76 credits |
| `e2e-report.json` | Machine-readable run report |

Fixed after reviewing the screenshots:
- The model linked nav items to `#schedule-1`-style ids. Added anchor fixing plus section-id anchors.
- `INR` showed instead of ₹. Now mapped.
- Two-item testimonials and team rows left gaps. Grids now centre.
- The dark hero's eyebrow and button were invisible. Brand colours are now lifted on tone bands.
- Recolouring turned body text green. The prompt now keeps text neutral.
- The model added a duplicate FAQ. The prompt now says to update instead.
- Gallery tiles were missing in full-page captures. This was a capture-timing problem (the script now waits for images and reveal animations), not a rendering bug.

### Quota and ops notes
- Free tier: gemini-3.8-flash is about 5 RPM and 20/day, flash-lite about 500/day. A generation is about 3.3k tokens in and 3.5k out; an edit about 5.3k in and 0.1–0.4k out.
- On 17 Nov the Gemini free tier was badly overloaded: many 503s, and one request hung until the 120 s limit. The fallback chain plus timeouts kept the product working. Users wait longer when this happens; the UI says "usually 20–60 s".
- Requests to Google count against the shared key's daily quota. There is no per-user rate limiting yet (Phase 3).

### Known gaps
- No auth, no database saving and no real credit ledger. Credits are client-side and can be reset, so they are a placeholder only.
- AI sites live in one browser's localStorage. Clearing it loses them.
- No streaming: generation is one blocking call (20–60 s, longer when Google is overloaded). Streaming the JSON or generating section by section would make it feel faster.
- AI edits only see the current page. There is no multi-page generation (sites come out as one page).
- No image search. Photos come only from the 101-image curated catalogue, so niches outside its 24 categories get the nearest category. An Unsplash or Pexels API key would lift this.
- Copy is not proofread. For example, the yoga site's model wrote "A Peak Into Our Sanctuary".
- The Anthropic provider is untested.
- `gemini-3.8-flash` output was never actually received: every attempt returned 503. Re-test when the free tier is less loaded (one generate call).
- Edits send the whole page JSON (about 5k tokens). Fine on flash-lite; with paid models, consider sending only the relevant sections.

### Env vars (see `app/.env.example`)
`LLM_PROVIDER`, `GEMINI_API_KEY`, `GENERATE_MODEL`, `GENERATE_FALLBACK_MODELS`, `EDIT_MODEL`, `EDIT_FALLBACK_MODELS`, `LLM_TIMEOUT_MS`, `LLM_CACHE_DIR` (dev only), `ANTHROPIC_API_KEY`, `ANTHROPIC_GENERATE_MODEL`, `ANTHROPIC_EDIT_MODEL`.

### Dev scripts
- `npx tsx scripts/ai-smoke.mts "<brief>" out.json`: generate without the server.
- `npx tsx scripts/ai-edit-smoke.mts site.json "<instruction>" [sectionId] [out.json]`: run an edit without the server.
- `node scripts/phase2-e2e.mjs [baseUrl] [outDir]`: full browser run with screenshots. It reuses the dev cache when `LLM_CACHE_DIR` is set.

### Next: Phase 3
Auth (email OTP / Google), a Postgres-backed `Site` table replacing localStorage, a real `CreditLedger` (spending checked server-side in `/api/generate` and `/api/edit` before the LLM call, with refunds on failure), per-user rate limits, then publish to a subdomain or static export, an iframe device preview, form submissions and Razorpay billing.
