import type { Env } from '../../shared/types/env';
import { createId } from '../utils/id';

export const createMagicLink = async (env: Env, email: string) => {
  const token = createId('magic');
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(email).first<{ id: string }>();
  const userId = user?.id ?? createId('user');

  if (!user) {
    await env.DB
      .prepare(`INSERT INTO users (id, email, display_name, handle, home_region, role, created_at, updated_at)
                VALUES (?1, ?2, 'New Angler', ?3, 'Unknown', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
      .bind(userId, email, `angler_${userId.slice(-6)}`)
      .run();
  }

  await env.DB
    .prepare(`INSERT INTO auth_accounts (id, user_id, provider, provider_user_id, access_token, created_at)
              VALUES (?1, ?2, 'magic_link', ?3, ?4, CURRENT_TIMESTAMP)`)
    .bind(createId('acct'), userId, email, token)
    .run();

  return { token, userId };
};

export const exchangeMagicLink = async (env: Env, token: string) => {
  return env.DB
    .prepare(`SELECT user_id as userId FROM auth_accounts WHERE provider = 'magic_link' AND access_token = ?1 LIMIT 1`)
    .bind(token)
    .first<{ userId: string }>();
};
