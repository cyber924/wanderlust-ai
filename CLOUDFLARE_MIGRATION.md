# Wanderlust AI — Cloudflare migration

This branch is the Cloudflare-native migration track. The original `main` branch is intentionally preserved.

## Architecture
- React + Vite frontend; existing screens and visual design are retained.
- Cloudflare Worker API in `src/worker.ts`.
- D1 for accounts, sessions, blog posts, image URL metadata, SNS packages, topic bookmarks, scheduled tasks, and publish logs.
- Gemini API key is a Worker secret (`GEMINI_API_KEY`); never expose it to Vite/client code.
- Google News is fetched server-side from RSS. A failed fetch returns an explicit error and an empty list, never fake headlines.
- Scheduled publishing is **visit-triggered**, not Cron-triggered: opening the scheduling page requests due pending tasks; the Worker atomically claims them from `pending` to `processing`. No Cron Trigger is configured.

## Initial setup
1. Create D1 database named `wanderlust-ai-db`.
2. Replace the placeholder `database_id` in `wrangler.toml`.
3. Apply `migrations/0001_initial.sql` with `wrangler d1 migrations apply wanderlust-ai-db --remote`.
4. Add secret: `wrangler secret put GEMINI_API_KEY`.
5. Build and deploy: `npm run build && npx wrangler deploy`.

## Migration status
The migration branch now contains a Cloudflare Worker API adapter used by the main application for email auth, D1 blog archive/publication, image URL metadata, SNS package archive, topic bookmarks, Google News RSS, Gemini generation endpoints, and visit-triggered deferred scheduling. The legacy Firebase migration utility and some AdminMenu-only simulated controls/localStorage paths still need a full audit before production use. The UI build and live Worker/D1 integration have not yet been verified.

## Required bindings and secrets
- D1 binding name: `DB`
- Static assets binding: `ASSETS`
- Worker secret: `GEMINI_API_KEY`
- Non-secret model variable: `GEMINI_MODEL=gemini-3.8-flash`

## Deferred publishing contract
There is deliberately no Cron Trigger in this project. The scheduling page asks `POST /api/scheduled/due` for overdue pending tasks. D1 conditionally changes each matching task from `pending` to `processing`, so simultaneous tabs cannot claim the same task twice. The browser then performs the generation workflow and writes the result through the Worker APIs. If nobody visits the scheduling page, queued tasks remain pending.
