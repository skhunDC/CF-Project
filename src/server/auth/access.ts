import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthContext, Env } from '../../shared/types/env';

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const parseAllowlist = (raw: string) =>
  new Set(
    raw
      .split(',')
      .map((entry) => normalizeEmail(entry))
      .filter(Boolean),
  );

const getHeader = (request: Request, name: string) => request.headers.get(name) ?? request.headers.get(name.toLowerCase());

const getDevIdentity = (request: Request, env: Env) => {
  if (env.DEV_AUTH_BYPASS !== 'true') return null;
  const email = getHeader(request, 'x-dev-auth-email');
  if (!email) return null;
  return {
    email,
    source: 'dev-bypass' as const,
  };
};

const verifyAccessJwt = async (request: Request, env: Env) => {
  const jwt = getHeader(request, 'cf-access-jwt-assertion');
  if (!jwt || !env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) return null;

  const issuer = `https://${env.CF_ACCESS_TEAM_DOMAIN}`;
  const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
  const verified = await jwtVerify(jwt, jwks, {
    issuer,
    audience: env.CF_ACCESS_AUD,
  });

  const emailClaim = typeof verified.payload.email === 'string' ? verified.payload.email : typeof verified.payload.sub === 'string' ? verified.payload.sub : null;
  if (!emailClaim) {
    throw new Error('Missing email claim in Cloudflare Access JWT.');
  }

  return {
    email: emailClaim,
    source: 'cloudflare-access-jwt' as const,
  };
};

const getAccessHeaderIdentity = (request: Request) => {
  const email = getHeader(request, 'cf-access-authenticated-user-email');
  if (!email) return null;
  return {
    email,
    source: 'cloudflare-access-header' as const,
  };
};

export const getAuthContext = async (request: Request, env: Env): Promise<AuthContext | null> => {
  const candidate = (await verifyAccessJwt(request, env).catch(() => null)) ?? getAccessHeaderIdentity(request) ?? getDevIdentity(request, env);
  if (!candidate) return null;

  const normalizedEmail = normalizeEmail(candidate.email);
  if (!parseAllowlist(env.ACCESS_ALLOWLIST).has(normalizedEmail)) {
    return null;
  }

  return {
    email: candidate.email,
    normalizedEmail,
    isAuthorized: true,
    source: candidate.source,
  };
};
