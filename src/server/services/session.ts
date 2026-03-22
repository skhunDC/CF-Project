import type { Env } from '../../shared/types/env';
import { createId } from '../utils/id';
import { sha256 } from '../utils/crypto';

export const createSession = async (env: Env, userId: string) => {
  const sessionId = createId('sess');
  const tokenHash = await sha256(sessionId + env.SESSION_SECRET);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  await env.DB
    .prepare(`INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)`)
    .bind(sessionId, userId, tokenHash, expiresAt)
    .run();

  return sessionId;
};

export const getSessionUser = async (env: Env, sessionId: string) => {
  const tokenHash = await sha256(sessionId + env.SESSION_SECRET);
  return env.DB
    .prepare(`
      SELECT sessions.id as sessionId, users.id, users.email, users.display_name as displayName, users.handle,
             users.home_region as homeRegion, users.favorite_species as favoriteSpecies, users.role
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?1 AND sessions.expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `)
    .bind(tokenHash)
    .first();
};

export const destroySession = async (env: Env, sessionId: string) => {
  const tokenHash = await sha256(sessionId + env.SESSION_SECRET);
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run();
};
