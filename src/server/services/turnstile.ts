import type { Env } from '../../shared/types/env';

export const verifyTurnstile = async (env: Env, token?: string, ip?: string) => {
  if (!token) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success: boolean };
  return data.success;
};
