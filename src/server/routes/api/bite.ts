import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { biteScoreQuerySchema } from '../../../shared/schema/bite';
import type { Env } from '../../../shared/types/env';
import { calculateBiteScore } from '../../utils/bite-score';

export const biteRoutes = new Hono<{ Bindings: Env }>();

biteRoutes.get('/', zValidator('query', biteScoreQuerySchema), async (c) => {
  const { region, speciesId } = c.req.valid('query');

  const snapshot = await c.env.DB
    .prepare(`SELECT * FROM weather_snapshots WHERE region = ?1 ORDER BY observed_at DESC LIMIT 1`)
    .bind(region)
    .first<any>();

  const recentCatchRate = await c.env.DB
    .prepare(`SELECT COUNT(*) / 10.0 as rate FROM catches WHERE created_at >= datetime('now', '-24 hours')`)
    .first<{ rate: number }>();

  const result = calculateBiteScore({
    moonPhase: Number(snapshot?.moon_phase ?? 0.55),
    pressureTrend: (snapshot?.pressure_trend as 'rising' | 'steady' | 'falling') ?? 'steady',
    windMph: Number(snapshot?.wind_mph ?? 8),
    cloudCover: Number(snapshot?.cloud_cover ?? 45),
    recentCatchRate: Number(recentCatchRate?.rate ?? 0.8),
    tempDelta: Number(snapshot?.temp_delta ?? 1),
  });

  await c.env.DB
    .prepare(`INSERT INTO bite_scores (id, region, species_id, score, confidence, why_json, created_at)
              VALUES (lower(hex(randomblob(8))), ?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)`)
    .bind(region, speciesId ?? null, result.score, result.confidence, JSON.stringify(result.factors))
    .run();

  return c.json({ ok: true, data: result });
});
