# Dublin Cleaners Care Desk

## Repo assessment

### Current structure kept

- Cloudflare Workers + Vite + React remain the core stack.
- Static assets are still built by Vite and served through the `ASSETS` binding.
- D1 remains the primary persistence layer.

### Risks and gaps that were fixed

- The previous repository centered on a broad fishing app with incomplete auth scaffolding and unactionable OAuth placeholders.
- Protected UI was not server-enforced for the new Dublin Cleaners requirements.
- Durable Objects, R2, and queue bindings added complexity without supporting the required workflow.
- The data model was far larger than needed for a focused production launch.

### Chosen auth strategy

Cloudflare Access is the primary authentication layer. The Worker verifies the Access identity server-side in `src/server/auth/access.ts` by:

1. Reading `Cf-Access-Jwt-Assertion` and verifying it against the Access JWKS when `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` are configured.
2. Falling back to `Cf-Access-Authenticated-User-Email` when Access headers are present.
3. Applying a single normalized email allowlist from `ACCESS_ALLOWLIST`.
4. Returning `null` unless both identity verification and allowlist checks pass.

This keeps the auth flow small, Cloudflare-native, and fail-closed.

### Chosen persistence strategy

D1 is used as the only persistence layer because the workflow is structured, relational enough for SQL, and does not require blob storage or cache-specific semantics. A single `service_briefs` table handles the focused workflow with audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`). No client-submitted identity fields are trusted.

## Implementation plan

### Auth + authorization

- Protect `/app` server-side.
- Protect every `/api/*` route server-side.
- Centralize allowlist parsing and identity normalization.
- Return branded HTML for unauthorized page requests and structured `403` JSON for unauthorized API requests.

### UX structure

- Public landing page at `/` with the Dublin Cleaners mark, one headline, one supporting line, one primary CTA, and one visual block.
- Private `/app` workspace with one primary job: logging and moving service briefs.
- Mobile-first layout, CSS variable tokens, and restrained motion (`riseIn`, `float`, `pulseGlow`).

### Data model

- `service_briefs` stores customer name, service type, due date, priority, status, notes, and audit fields.
- Writes happen only through Worker routes.
- Validation uses `zod` in `src/server/validation/brief.ts`.

### Server/client split

- Worker renders public and unauthorized HTML.
- Worker alone decides whether the protected app shell is served.
- React handles the authorized workspace interactions after the server has already allowed the request.
- D1 reads and writes are server-only.

### Testing plan

- Unit tests for allowlist/auth normalization.
- Unit tests for data validation.
- Integration tests for protected page and API behavior.

### Docs plan

- This file covers setup, deployment, env vars, auth, persistence, and testing.
- `docs/AGENTS.md` documents how future contributors should preserve the fail-closed model.

### Cloudflare deployment shape

- Workers runtime serves public pages, protected app shell, and JSON APIs.
- Vite builds the SPA bundle to `dist`.
- D1 stores all operational data.
- Cloudflare Access should sit in front of the Worker route in production.

## Auth flow

### How identity is verified

- Preferred path: verify `Cf-Access-Jwt-Assertion` against the Access JWKS exposed at `https://<team-domain>/cdn-cgi/access/certs`.
- Practical fallback: consume `Cf-Access-Authenticated-User-Email` when Access headers are present.
- Local/test bypass: `DEV_AUTH_BYPASS=true` lets tests or local-only requests supply `x-dev-auth-email`; production should keep this disabled.

### Where allowlist enforcement happens

- Only in `src/server/auth/access.ts`.
- `ACCESS_ALLOWLIST` is read once per request, normalized, and checked against the verified identity.

### What unauthorized users see

- `/app` responds with a branded HTML unauthorized page.
- `/api/*` responds with `403` JSON.
- Protected UI and data are never returned to unauthorized requests.

### How protected UI routes are blocked

- `GET /app` checks `getAuthContext(...)` before returning `index.html` from `ASSETS`.
- If auth fails, the Worker returns branded unauthorized HTML instead of the app shell.

### How protected API/data routes are blocked

- `app.use('/api/*', ...)` in `src/server/app.ts` rejects all requests without a valid auth context.

## Persistence model

### Schema

`service_briefs`

- `id`
- `customer_name`
- `service_type`
- `due_date`
- `priority`
- `status`
- `notes`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

### Read/write boundaries

- The browser never talks to D1 directly.
- Reads use `GET /api/session` and `GET /api/briefs`.
- Writes use `POST /api/briefs` and `POST /api/briefs/:id/status`.

### Validation rules

- `customerName`: 2–80 chars
- `serviceType`: strict enum
- `dueDate`: `YYYY-MM-DD` and valid calendar date
- `priority`: integer 1–3
- `notes`: 10–600 chars
- `status`: strict enum

## Setup

### Install

```bash
npm install
```

### Required bindings and variables

Set these non-secret vars in `wrangler.jsonc` or environment-specific Wrangler config:

- `APP_NAME`
- `APP_URL`
- `BRAND_LOGO_URL`
- `ACCESS_ALLOWLIST`
- `CF_ACCESS_TEAM_DOMAIN`
- `CF_ACCESS_AUD`
- `DEV_AUTH_BYPASS` (`false` in production)

Bindings:

- `DB` → D1 database
- `ASSETS` → Vite output

### Create D1

```bash
wrangler d1 create dublin-cleaners-care-desk
```

Copy the returned `database_id` into `wrangler.jsonc`.

### Apply migrations

Local:

```bash
npm run db:migrate
```

Remote:

```bash
npm run db:migrate:remote
```

## Deployment

1. Build the frontend bundle.
2. Configure the Worker, D1, and Cloudflare Access application.
3. Ensure Access injects the identity headers/JWT.
4. Ensure the allowed emails are present in `ACCESS_ALLOWLIST`.
5. Deploy.

```bash
npm run deploy
```

## Testing

```bash
npm test
npm run check
```

## Assumptions

- Cloudflare Access protects the production hostname in front of this Worker.
- The two authorized emails remain the only allowed users unless `ACCESS_ALLOWLIST` changes.
- The logo can be referenced from the production Dublin Cleaners asset URL.
