import { Hono } from 'hono';
import type { Env } from '../../../shared/types/env';
import { requireAuth } from '../../middleware/session';

export const meRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>();

meRoutes.use('*', requireAuth);

meRoutes.get('/', async (c) => {
  const user = c.get('user');
  const stats = await c.env.DB
    .prepare(`
      SELECT COUNT(*) as totalCatches,
             MAX(weight_lb) as biggestWeight,
             MAX(length_in) as biggestLength,
             SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verifiedCatches
      FROM catches
      WHERE user_id = ?1
    `)
    .bind(user.id)
    .first();

  const badges = await c.env.DB
    .prepare(`
      SELECT badges.id, badges.name, badges.description, user_badges.earned_at
      FROM user_badges
      JOIN badges ON badges.id = user_badges.badge_id
      WHERE user_badges.user_id = ?1
      ORDER BY user_badges.earned_at DESC
      LIMIT 8
    `)
    .bind(user.id)
    .all();

  return c.json({ ok: true, data: { user, stats, badges: badges.results } });
});
