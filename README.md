# DevCognix Site Builder (MVP)

AI website builder by DevCognix: describe a business, get a full animated site, then edit by clicking or chatting.

- Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, zod, Prisma
- 20 original animated section components, 4 starter templates
- AI generation + chat edits (JSON Patch) via a provider-agnostic LLM layer (Gemini free tier now, Claude later)

## Run locally
```bash
cp .env.example .env.local   # add GEMINI_API_KEY
npm install
npx prisma generate
npm run dev
```

See `docs/BUILD_LOG.md` for phases, decisions and known gaps.
