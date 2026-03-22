import type { Env } from '../../shared/types/env';
import { calculateLeaguePoints } from '../utils/league-score';

interface CatchEventMessage {
  type: 'catch.created';
  catchId: string;
  userId: string;
  createdAt: string;
}

export class LeaderboardRoom {
  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/score' && request.method === 'POST') {
      const payload = (await request.json()) as { leagueId: string; userId: string; metric: 'biggest_fish' | 'most_fish' | 'mixed'; lengthIn: number; weightLb: number; isVerified: boolean };
      const points = calculateLeaguePoints(payload.metric, payload);
      const key = `league:${payload.leagueId}:user:${payload.userId}`;
      const current = (await this.state.storage.get<number>(key)) ?? 0;
      const next = current + points;
      await this.state.storage.put(key, next);
      return Response.json({ ok: true, score: next });
    }

    return Response.json({ ok: false, error: 'Unsupported operation' }, { status: 400 });
  }
}

export const processCatchEvent = async (env: Env, message: CatchEventMessage) => {
  const catchRecord = await env.DB
    .prepare(`SELECT id, user_id as userId, species_id as speciesId, length_in as lengthIn, weight_lb as weightLb, verification_status as verificationStatus FROM catches WHERE id = ?1`)
    .bind(message.catchId)
    .first<any>();

  if (!catchRecord) return;

  const leagues = await env.DB.prepare(`SELECT id, metric FROM leagues WHERE species_id IS NULL OR species_id = ?1`).bind(catchRecord.speciesId).all<any>();

  for (const league of leagues.results) {
    const id = env.LEADERBOARD_ROOM.idFromName(league.id);
    const stub = env.LEADERBOARD_ROOM.get(id);
    const scoreResponse = await stub.fetch('https://leaderboard.internal/score', {
      method: 'POST',
      body: JSON.stringify({
        leagueId: league.id,
        userId: catchRecord.userId,
        metric: league.metric,
        lengthIn: catchRecord.lengthIn,
        weightLb: catchRecord.weightLb,
        isVerified: catchRecord.verificationStatus === 'verified',
      }),
    });

    const scorePayload = (await scoreResponse.json()) as { score: number };
    await env.DB
      .prepare(`
        INSERT INTO league_scores (id, league_id, user_id, score, updated_at)
        VALUES (lower(hex(randomblob(8))), ?1, ?2, ?3, CURRENT_TIMESTAMP)
        ON CONFLICT(league_id, user_id) DO UPDATE SET score = excluded.score, updated_at = CURRENT_TIMESTAMP
      `)
      .bind(league.id, catchRecord.userId, scorePayload.score)
      .run();
  }
};
