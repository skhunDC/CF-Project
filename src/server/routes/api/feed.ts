import { Hono } from 'hono';
import type { Env } from '../../../shared/types/env';

export const feedRoutes = new Hono<{ Bindings: Env }>();

feedRoutes.get('/', async (c) => {
  const recentCatches = await c.env.DB
    .prepare(`
      SELECT catches.id, catches.length_in as lengthIn, catches.weight_lb as weightLb, catches.public_lat as publicLat,
             catches.public_lng as publicLng, catches.verification_status as verificationStatus,
             catches.caught_at as caughtAt, users.display_name as displayName, species.name as speciesName,
             catch_photos.variant_url as imageUrl
      FROM catches
      JOIN users ON users.id = catches.user_id
      JOIN species ON species.id = catches.species_id
      LEFT JOIN catch_photos ON catch_photos.catch_id = catches.id AND catch_photos.is_primary = 1
      ORDER BY catches.created_at DESC
      LIMIT 12
    `)
    .all();

  return c.json({ ok: true, data: recentCatches.results });
});
