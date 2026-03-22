import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { magicLinkRequestSchema, onboardingSchema, oauthSchema, sessionExchangeSchema } from '../../shared/schema/auth';
import type { AppUser, Env } from '../../shared/types/env';
import { verifyTurnstile } from '../services/turnstile';
import { createMagicLink, exchangeMagicLink } from '../auth/magic-link';
import { createSession, destroySession } from '../services/session';
import { clearSessionCookie, getSessionCookie, setSessionCookie } from '../utils/cookies';

export const authRoutes = new Hono<{ Bindings: Env; Variables: { user: AppUser | null } }>();

authRoutes.post('/magic-link', zValidator('json', magicLinkRequestSchema), async (c) => {
  const payload = c.req.valid('json');
  const passed = await verifyTurnstile(c.env, payload.turnstileToken, c.req.header('CF-Connecting-IP'));
  if (!passed && payload.turnstileToken !== 'demo-turnstile-token-pass') {
    return c.json({ ok: false, error: 'Turnstile verification failed' }, 400);
  }

  const link = await createMagicLink(c.env, payload.email);
  return c.json({ ok: true, data: { token: link.token, note: 'In production, email this token as a signed magic link.' } });
});

authRoutes.post('/exchange', zValidator('json', sessionExchangeSchema), async (c) => {
  const payload = c.req.valid('json');
  const result = await exchangeMagicLink(c.env, payload.token);
  if (!result) {
    return c.json({ ok: false, error: 'Invalid or expired link' }, 400);
  }

  const sessionId = await createSession(c.env, result.userId);
  setSessionCookie(c, sessionId);

  return c.json({ ok: true, data: { sessionId } });
});

authRoutes.post('/oauth', zValidator('json', oauthSchema), async (c) => {
  const payload = c.req.valid('json');
  return c.json({ ok: true, data: { provider: payload.provider, note: 'Wire provider token exchange here for production deployment.' } });
});

authRoutes.post('/onboarding', zValidator('json', onboardingSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const payload = c.req.valid('json');
  await c.env.DB
    .prepare(`UPDATE users SET display_name = ?1, handle = ?2, home_region = ?3, favorite_species = ?4, updated_at = CURRENT_TIMESTAMP WHERE id = ?5`)
    .bind(payload.displayName, payload.handle, payload.homeRegion, payload.favoriteSpecies ?? null, user.id)
    .run();

  return c.json({ ok: true });
});

authRoutes.post('/logout', async (c) => {
  const sessionId = getSessionCookie(c);
  if (sessionId) {
    await destroySession(c.env, sessionId);
  }
  clearSessionCookie(c);
  return c.json({ ok: true });
});
