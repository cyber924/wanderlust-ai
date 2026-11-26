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
The API foundation is being ported incrementally. The existing Firebase client is not removed until each corresponding UI workflow has been migrated and verified. Do not connect production traffic to this branch until the migration checklist is complete.
