import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { joinLeagueSchema, leagueListQuerySchema } from '../../../shared/schema/leagues';
import type { Env } from '../../../shared/types/env';
import { requireAuth } from '../../middleware/session';

export const leaguesRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>();

leaguesRoutes.get('/', zValidator('query', leagueListQuerySchema), async (c) => {
  const { scope, metric } = c.req.valid('query');
  const stmt = c.env.DB.prepare(`
    SELECT leagues.*, COUNT(league_members.id) as memberCount
    FROM leagues
    LEFT JOIN league_members ON league_members.league_id = leagues.id
    WHERE (?1 IS NULL OR leagues.scope = ?1) AND (?2 IS NULL OR leagues.metric = ?2)
    GROUP BY leagues.id
    ORDER BY leagues.created_at DESC
  `).bind(scope ?? null, metric ?? null);

  const result = await stmt.all();
  return c.json({ ok: true, data: result.results });
});

leaguesRoutes.get('/:id', async (c) => {
  const league = await c.env.DB.prepare('SELECT * FROM leagues WHERE id = ?1').bind(c.req.param('id')).first();
  const leaderboard = await c.env.DB
    .prepare(`
      SELECT league_scores.*, users.display_name as displayName, users.handle
      FROM league_scores
      JOIN users ON users.id = league_scores.user_id
      WHERE league_scores.league_id = ?1
      ORDER BY league_scores.score DESC, league_scores.updated_at ASC
      LIMIT 100
    `)
    .bind(c.req.param('id'))
    .all();

  return c.json({ ok: true, data: { league, leaderboard: leaderboard.results } });
});

leaguesRoutes.post('/join', requireAuth, zValidator('json', joinLeagueSchema), async (c) => {
  const user = c.get('user');
  const { leagueId } = c.req.valid('json');
  await c.env.DB
    .prepare(`INSERT OR IGNORE INTO league_members (id, league_id, user_id, role, joined_at) VALUES (lower(hex(randomblob(8))), ?1, ?2, 'member', CURRENT_TIMESTAMP)`)
    .bind(leagueId, user.id)
    .run();

  return c.json({ ok: true });
});
