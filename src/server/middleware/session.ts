import { createMiddleware } from 'hono/factory';
import type { Env, AppUser } from '../../shared/types/env';
import { getSessionCookie } from '../utils/cookies';
import { getSessionUser } from '../services/session';

export const sessionMiddleware = createMiddleware<{ Bindings: Env; Variables: { user: AppUser | null } }>(async (c, next) => {
  const sessionId = getSessionCookie(c);
  if (!sessionId) {
    c.set('user', null);
    return next();
  }

  const user = await getSessionUser(c.env, sessionId);
  c.set('user', (user as AppUser | null) ?? null);
  await next();
});

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: { user: AppUser | null } }>(async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  await next();
});

export const requireAdmin = createMiddleware<{ Bindings: Env; Variables: { user: AppUser | null } }>(async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }
  await next();
});
