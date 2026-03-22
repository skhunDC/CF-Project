# Repository operating notes

## Product intent

Keep this app focused on one secure operational workflow for Dublin Cleaners. Do not expand it into a generic dashboard unless the new feature directly supports the service-brief flow.

## Auth rules

- Cloudflare Access is the required production authentication layer.
- All authorization must remain server-enforced.
- Keep allowlist logic centralized in `src/server/auth/access.ts`.
- Never ship public signup, client-only auth, or duplicated allowlist checks.
- `/app` and every `/api/*` route must fail closed.

## Persistence rules

- Use D1 as the primary store.
- Add schema changes through migrations only.
- Preserve server-side audit fields.
- Never trust client-submitted identity metadata.

## UX rules

- The first viewport should stay strongly branded and mobile-first.
- Use CSS variables/tokens for color, spacing, and motion.
- Keep motion subtle and purposeful.
- Prefer one strong CTA over multiple competing actions.

## Testing rules

- Add or update unit tests for auth and validation changes.
- Add or update integration tests when protected route behavior changes.
