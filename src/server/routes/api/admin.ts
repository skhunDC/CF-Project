import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { moderationSchema } from '../../../shared/schema/catches';
import type { Env } from '../../../shared/types/env';
import { requireAdmin } from '../../middleware/session';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>();

adminRoutes.use('*', requireAdmin);

adminRoutes.get('/flags', async (c) => {
  const flags = await c.env.DB
    .prepare(`
      SELECT moderation_flags.*, catches.length_in as lengthIn, catches.weight_lb as weightLb, users.display_name as displayName
      FROM moderation_flags
      JOIN catches ON catches.id = moderation_flags.catch_id
      JOIN users ON users.id = catches.user_id
      ORDER BY moderation_flags.created_at DESC
      LIMIT 100
    `)
    .all();

  return c.json({ ok: true, data: flags.results });
});

adminRoutes.post('/moderate', zValidator('json', moderationSchema), async (c) => {
  const payload = c.req.valid('json');
  const status = payload.action === 'approve' ? 'verified' : payload.action === 'flag' ? 'flagged' : 'rejected';

  await c.env.DB.prepare('UPDATE catches SET verification_status = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2').bind(status, payload.catchId).run();
  await c.env.DB
    .prepare(`INSERT INTO moderation_flags (id, catch_id, reason, status, created_at) VALUES (lower(hex(randomblob(8))), ?1, ?2, ?3, CURRENT_TIMESTAMP)`)
    .bind(payload.catchId, payload.reason, payload.action)
    .run();

  return c.json({ ok: true });
});
