import { Hono } from 'hono';
import type { Env } from '../../../shared/types/env';

export const mapRoutes = new Hono<{ Bindings: Env }>();

mapRoutes.get('/hotspots', async (c) => {
  const zones = await c.env.DB
    .prepare(`
      SELECT public_geohash_zone as zone, AVG(public_lat) as lat, AVG(public_lng) as lng,
             COUNT(*) as catchCount, MAX(caught_at) as lastCaughtAt
      FROM catches
      GROUP BY public_geohash_zone
      ORDER BY catchCount DESC
      LIMIT 50
    `)
    .all();

  return c.json({ ok: true, data: zones.results });
});
