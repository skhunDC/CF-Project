import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import type { AppUser, Env } from '../../shared/types/env';

type AppContext = Context<{ Bindings: Env; Variables: { user: AppUser | null } }>;

export const getSessionCookie = (c: AppContext) => getCookie(c, c.env.COOKIE_NAME);

export const setSessionCookie = (c: AppContext, sessionId: string, maxAge = 60 * 60 * 24 * 30) => {
  setCookie(c, c.env.COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    path: '/',
    maxAge,
  });
};

export const clearSessionCookie = (c: AppContext) => {
  deleteCookie(c, c.env.COOKIE_NAME, { path: '/' });
};
