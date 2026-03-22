# Catch + Compete + Predict

A mobile-first Cloudflare Workers fishing app for fast catch logging, live leaderboards, bite prediction, and privacy-safe hotspot discovery.

## Stack

- **Cloudflare Workers** for full-stack hosting and API execution
- **React + Vite + TypeScript** for the SPA frontend
- **Hono** for API routing
- **Tailwind CSS** for dark-mode-first mobile UI
- **D1** for relational data
- **Durable Objects** for live leaderboard scoring locks/state
- **Queues** for async catch event processing
- **R2 + Images-ready upload flow** for catch photos
- **Turnstile** hooks for signup/login and suspicious catch flows
- **HTTP-only cookie sessions** for auth

## Project structure

```txt
.
├── migrations/
│   └── 0001_initial.sql
├── scripts/
│   └── seed.ts
├── src/
│   ├── client/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── server/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── shared/
│   │   ├── constants/
│   │   ├── schema/
│   │   └── types/
│   └── worker.ts
├── .dev.vars.example
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
```

## Features included

### Core user flows

- Email magic link auth scaffold with Turnstile enforcement
- OAuth entry points for Google and Apple with notes for wiring provider exchange
- Onboarding for display name, handle, home region, and favorite species
- Bite score dashboard with weighted heuristic factors and confidence
- Fast catch logging flow with prefilled timestamp/location and optimistic-friendly mutation pattern
- Privacy-safe hotspot map using blurred public catch zones
- League list plus live leaderboard detail backed by Durable Object score accumulation
- Profile stats and badges
- Admin moderation dashboard for suspicious catches

### Privacy and verification

- Exact coordinates stored in `private_lat` / `private_lng`
- Public map exposure limited to blurred `public_lat` / `public_lng` and a rounded zone key
- Catch verification status supports `pending`, `verified`, `flagged`, and admin review patterns
- Verification evidence table supports EXIF/GPS confidence logging

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure local secrets

Copy sample vars and fill in secrets:

```bash
cp .dev.vars.example .dev.vars
```

### 3. Create the local D1 database schema

```bash
npm run db:migrate
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Run the frontend

```bash
npm run dev
```

### 6. Run the Worker locally

```bash
npm run dev:worker
```

> For integrated local development, run Vite and Wrangler in separate terminals. Vite builds the client, while Wrangler exposes the Worker routes and Cloudflare bindings.

## Deployment to Cloudflare

1. Create a D1 database:
   ```bash
   wrangler d1 create catch-compete-predict
   ```
2. Replace `database_id` in `wrangler.jsonc`.
3. Create an R2 bucket:
   ```bash
   wrangler r2 bucket create catch-uploads
   ```
4. Create a Queue:
   ```bash
   wrangler queues create catch-events
   ```
5. Create or bind a Turnstile widget and copy the site key to `vars`, secret to a Worker secret.
6. Set production secrets:
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   wrangler secret put SESSION_SECRET
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put APPLE_PRIVATE_KEY
   wrangler secret put QUEUE_WEBHOOK_SECRET
   ```
7. Apply migrations remotely:
   ```bash
   npm run db:migrate:remote
   ```
8. Deploy:
   ```bash
   npm run deploy
   ```

## Environment variables and bindings

### Non-secret `vars` in `wrangler.jsonc`

- `APP_NAME`
- `APP_URL`
- `COOKIE_NAME`
- `PUBLIC_MAP_BLUR_RADIUS_METERS`
- `TURNSTILE_SITE_KEY`
- `GOOGLE_CLIENT_ID`
- `APPLE_CLIENT_ID`
- `MAGIC_LINK_FROM_EMAIL`

### Secrets to configure

- `TURNSTILE_SECRET_KEY`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `QUEUE_WEBHOOK_SECRET`

### Bound resources

- `DB` → Cloudflare D1
- `LEADERBOARD_ROOM` → Durable Object
- `CATCH_EVENTS_QUEUE` → Queue producer/consumer
- `CATCH_UPLOADS` → R2 bucket
- `IMAGES` → Cloudflare Images binding
- `ASSETS` → deployed static frontend assets

## Turnstile validation notes

- `/auth/magic-link` validates Turnstile before issuing a dev magic token.
- `/api/catches` accepts an optional Turnstile token for suspicious submissions.
- In local dev, the sample auth screen uses `demo-turnstile-token-pass` as a fallback token.
- In production, replace this fallback with the real Turnstile widget token from the client.

## Images and R2 upload notes

- The current upload flow requests an app-generated upload URL from `/api/catches/upload-url`.
- The Worker stores originals in R2 under `catches/<userId>/...`.
- `catch_photos.variant_url` is ready to store an Images delivery URL once you connect an Images pipeline.
- For production hardening, swap the current Worker PUT route with a signed direct-upload flow and post-process originals into Images variants.

## Durable Object notes

- `LeaderboardRoom` owns per-league score increments.
- Queue consumers call the Durable Object so scoring updates are serialized and race-safe.
- D1 remains the queryable source for leaderboard reads, while the Durable Object acts as the scoring lock and aggregation gate.

## Queue consumer notes

- Every created catch publishes a `catch.created` event.
- The consumer loads the catch, finds eligible leagues, calls the Durable Object, and upserts `league_scores`.
- This keeps catch logging fast while leaderboard work happens asynchronously.

## Bite score engine notes

The heuristic engine lives in `src/server/utils/bite-score.ts` and combines:

- moon phase alignment
- pressure trend
- wind suitability
- cloud cover/light penetration
- temperature stability
- recent catch rate

It returns:

- score from `0–100`
- confidence from `40–96`
- a human-readable best-window label
- “why this score” factors for the client

## Admin moderation workflow

1. Suspicious or user-reported catches create entries in `moderation_flags`.
2. Admin opens `/admin`.
3. Admin reviews catch context and reason.
4. Admin approves, flags, or rejects.
5. Catch verification state is updated and the moderation action is logged.

## API routes

- `/auth/*`
- `/api/me/*`
- `/api/catches/*`
- `/api/feed`
- `/api/map/*`
- `/api/leagues/*`
- `/api/bite/*`
- `/api/admin/*`

## Production hardening checklist

- Replace the local magic-link token return with a signed email-delivery flow.
- Complete Google/Apple OAuth code exchange.
- Add stronger EXIF/GPS verification parsing in the queue pipeline.
- Convert the current placeholder hotspot rendering into a real tile/map implementation.
- Add direct Cloudflare Images transforms and signed image delivery.
- Add formal unit tests around heuristic scoring, auth helpers, and league scoring.

## Useful commands

```bash
npm run check
npm run db:migrate
npm run db:seed
npm run deploy
```
