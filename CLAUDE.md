# AI Travel Planner — project context for Claude Code

## What this is
A portfolio web app. User picks a destination, number of days, budget and interests.
The app retrieves **real** places from a Places API, then uses an LLM to arrange them into
a day-by-day itinerary. Users sign in, save trips, and share them by link.

## Non-negotiable architectural rules
1. **The LLM never invents places.** It receives a list of candidate places (with ids) and
   may only reference those ids. Any id it returns that we didn't supply is dropped
   server-side before persisting.
2. **All LLM and Places calls happen server-side.** No `NEXT_PUBLIC_` key for them, ever.
3. **LLM output is validated with Zod** before it reaches the database. On parse failure:
   one repair retry, then a graceful error — never a crash, never a partial write.
4. **Cache aggressively.** Places are cached per destination in Postgres. Generated trips
   are cached by `promptHash` (SHA-256 of the normalised request).
5. **Providers are behind interfaces**: `LLMProvider` and `PlacesProvider`. Swapping
   Gemini → OpenAI, or Geoapify → Google Places, must be a single adapter file.

## Stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Vercel AI SDK (`ai`, `@ai-sdk/google`) — `generateObject` / `streamObject` with Zod
- Postgres on Neon, Drizzle ORM
- Auth.js (NextAuth) with Google OAuth only
- MapLibre GL JS for maps
- Zod for all validation
- Deployed on Vercel

## Conventions
- `src/app` routes, `src/lib` logic, `src/db` schema & queries, `src/components` UI.
- Server Actions or Route Handlers for mutations; no client-side fetching of secrets.
- Explicit types on exported functions. No `any`.
- Small, focused commits with conventional-commit messages.
- Prefer editing existing files over creating new ones.

## Current status
<!-- Update this as you go so Claude Code always knows where you are -->
- [ ] Day 0 — scaffold & repo
- [x] Day 1 — API spikes (done as the core engine below, not throwaway scripts)
- [ ] Day 2 — DB schema
- [x] Day 3 — places layer + cache (`src/places/`, `src/cache/simpleCache.ts` — JSON file, not Postgres yet)
- [x] Day 4–5 — generation engine (`src/itinerary/`) — needs a real run with API keys to confirm
- [ ] Day 6 — auth
- [ ] Day 7 — form + streaming
- [ ] Day 8 — itinerary UI + map
- [ ] Day 9 — save/share trips
- [ ] Day 10 — hardening
- [ ] Day 11 — deploy
- [ ] Day 12 — README, demo video, tests

## Note on current structure
The core engine (`src/`) was built standalone, outside Next.js, so it could be tested
from the CLI (`npm run demo`) without any framework/DB/auth scaffolding. When you run
Day 0/2, this logic moves into `src/lib/` largely as-is: `generateItinerary.ts`,
`promptBuilder.ts`, `schema.ts`, and the provider adapters don't need framework code to
work — they just need to be called from a Route Handler instead of `src/index.ts`, and
`simpleCache.ts` needs to become Drizzle queries against the `places`/`trips` tables.

## What not to build
Collaborative editing, bookings, payments, notifications, i18n, admin panel, chat UI.
