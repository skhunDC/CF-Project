import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { catchQuerySchema, createCatchSchema } from '../../../shared/schema/catches';
import type { Env } from '../../../shared/types/env';
import { requireAuth } from '../../middleware/session';
import { blurCoordinates } from '../../utils/geo';
import { createId } from '../../utils/id';
import { createUploadUrl, saveImageToR2 } from '../../services/uploads';
import { processCatchEvent } from '../../services/leaderboard-room';
import { verifyTurnstile } from '../../services/turnstile';

export const catchesRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>();

catchesRoutes.get('/', zValidator('query', catchQuerySchema), async (c) => {
  const { limit, speciesId } = c.req.valid('query');

  const stmt = speciesId
    ? c.env.DB.prepare(`
        SELECT catches.id, catches.length_in as lengthIn, catches.weight_lb as weightLb, catches.caught_at as caughtAt,
               catches.verification_status as verificationStatus, species.name as speciesName, users.display_name as displayName,
               catch_photos.variant_url as imageUrl
        FROM catches
        JOIN species ON species.id = catches.species_id
        JOIN users ON users.id = catches.user_id
        LEFT JOIN catch_photos ON catch_photos.catch_id = catches.id AND catch_photos.is_primary = 1
        WHERE catches.species_id = ?1
        ORDER BY catches.created_at DESC
        LIMIT ?2
      `).bind(speciesId, limit)
    : c.env.DB.prepare(`
        SELECT catches.id, catches.length_in as lengthIn, catches.weight_lb as weightLb, catches.caught_at as caughtAt,
               catches.verification_status as verificationStatus, species.name as speciesName, users.display_name as displayName,
               catch_photos.variant_url as imageUrl
        FROM catches
        JOIN species ON species.id = catches.species_id
        JOIN users ON users.id = catches.user_id
        LEFT JOIN catch_photos ON catch_photos.catch_id = catches.id AND catch_photos.is_primary = 1
        ORDER BY catches.created_at DESC
        LIMIT ?1
      `).bind(limit);

  const result = await stmt.all();
  return c.json({ ok: true, data: result.results });
});

catchesRoutes.get('/:id', async (c) => {
  const record = await c.env.DB
    .prepare(`
      SELECT catches.*, species.name as speciesName, users.display_name as displayName, users.handle,
             waters.name as waterName, catch_photos.original_key as photoKey, catch_photos.variant_url as imageUrl
      FROM catches
      JOIN species ON species.id = catches.species_id
      JOIN users ON users.id = catches.user_id
      LEFT JOIN waters ON waters.id = catches.water_id
      LEFT JOIN catch_photos ON catch_photos.catch_id = catches.id AND catch_photos.is_primary = 1
      WHERE catches.id = ?1
      LIMIT 1
    `)
    .bind(c.req.param('id'))
    .first();

  if (!record) {
    return c.json({ ok: false, error: 'Catch not found' }, 404);
  }

  return c.json({ ok: true, data: record });
});

catchesRoutes.post('/', requireAuth, zValidator('json', createCatchSchema), async (c) => {
  const user = c.get('user');
  const payload = c.req.valid('json');

  if (payload.turnstileToken) {
    const passed = await verifyTurnstile(c.env, payload.turnstileToken, c.req.header('CF-Connecting-IP'));
    if (!passed) {
      return c.json({ ok: false, error: 'Turnstile verification failed' }, 400);
    }
  }

  const catchId = createId('catch');
  const blur = blurCoordinates(payload.lat, payload.lng, Number(c.env.PUBLIC_MAP_BLUR_RADIUS_METERS));
  const verificationStatus = payload.photoKey ? 'verified' : 'pending';

  await c.env.DB
    .prepare(`
      INSERT INTO catches (
        id, user_id, species_id, water_id, length_in, weight_lb, lure, notes,
        private_lat, private_lng, public_lat, public_lng, public_geohash_zone,
        verification_status, caught_at, created_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `)
    .bind(
      catchId,
      user.id,
      payload.speciesId,
      payload.waterId ?? null,
      payload.lengthIn,
      payload.weightLb,
      payload.lure ?? null,
      payload.notes ?? null,
      payload.lat,
      payload.lng,
      blur.publicLat,
      blur.publicLng,
      blur.geohash,
      verificationStatus,
      payload.caughtAt ?? new Date().toISOString(),
    )
    .run();

  if (payload.photoKey) {
    await c.env.DB
      .prepare(`INSERT INTO catch_photos (id, catch_id, original_key, variant_url, is_primary, created_at) VALUES (?1, ?2, ?3, ?4, 1, CURRENT_TIMESTAMP)`)
      .bind(createId('photo'), catchId, payload.photoKey, `/api/catches/photo/${payload.photoKey}`)
      .run();
  }

  const catchEvent = {
    type: 'catch.created' as const,
    catchId,
    userId: user.id,
    createdAt: new Date().toISOString(),
  };

  if (c.env.CATCH_EVENTS_QUEUE) {
    await c.env.CATCH_EVENTS_QUEUE.send(catchEvent);
  } else {
    console.warn('CATCH_EVENTS_QUEUE binding missing; processing catch event inline.');
    await processCatchEvent(c.env, catchEvent);
  }

  return c.json({ ok: true, data: { id: catchId, verificationStatus } }, 201);
});

catchesRoutes.post('/upload-url', requireAuth, async (c) => {
  const user = c.get('user');
  const upload = await createUploadUrl(c.env, user.id);
  return c.json({ ok: true, data: upload });
});

catchesRoutes.put('/upload/:key{.+}', requireAuth, async (c) => {
  const key = c.req.param('key');
  const body = await c.req.arrayBuffer();
  const contentType = c.req.header('content-type') ?? 'image/jpeg';
  await saveImageToR2(c.env, key, body, contentType);
  return c.json({ ok: true, data: { key } });
});

catchesRoutes.get('/photo/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.CATCH_UPLOADS.get(key);
  if (!object) {
    return c.json({ ok: false, error: 'Photo not found' }, 404);
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType ?? 'image/jpeg',
      'cache-control': 'public, max-age=3600',
    },
  });
});
