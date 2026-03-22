import { Hono } from 'hono';
import type { AuthContext, Env } from '../shared/types/env';
import { getAuthContext } from './auth/access';
import { createBrief, getBriefMetrics, listBriefs, updateBriefStatus } from './data/briefs';
import { jsonUnauthorized, renderAppShellBlocked, renderLandingPage } from './html/render';
import { createBriefSchema, updateStatusSchema } from './validation/brief';

export type AppBindings = { Bindings: Env; Variables: { auth: AuthContext | null } };

export const createApp = () => {
  const app = new Hono<AppBindings>();

  app.use('*', async (c, next) => {
    const auth = await getAuthContext(c.req.raw, c.env);
    c.set('auth', auth);
    await next();
  });

  app.get('/', (c) => c.html(renderLandingPage(c.env)));

  app.get('/health', (c) => c.json({ ok: true, name: c.env.APP_NAME }));

  app.get('/app', async (c) => {
    const auth = c.get('auth');
    if (!auth) return renderAppShellBlocked(c.env);

    return c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url).toString(), c.req.raw), {
      headers: {
        ...Object.fromEntries(c.req.raw.headers.entries()),
        'x-authenticated-email': auth.normalizedEmail,
      },
    });
  });

  app.use('/api/*', async (c, next) => {
    if (!c.get('auth')) {
      return jsonUnauthorized();
    }
    await next();
  });

  app.get('/api/session', async (c) => {
    const auth = c.get('auth')!;
    const metrics = await getBriefMetrics(c.env);
    return c.json({ ok: true, data: { auth, metrics } });
  });

  app.get('/api/briefs', async (c) => {
    const items = await listBriefs(c.env);
    return c.json({ ok: true, data: items });
  });

  app.post('/api/briefs', async (c) => {
    const auth = c.get('auth')!;
    const json = await c.req.json();
    const parsed = createBriefSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ ok: false, error: 'validation_failed', issues: parsed.error.flatten() }, 400);
    }

    await createBrief(c.env, parsed.data, auth.normalizedEmail);
    const items = await listBriefs(c.env);
    return c.json({ ok: true, data: items }, 201);
  });

  app.post('/api/briefs/:id/status', async (c) => {
    const auth = c.get('auth')!;
    const json = await c.req.json();
    const parsed = updateStatusSchema.safeParse(json);
    if (!parsed.success) {
      return c.json({ ok: false, error: 'validation_failed', issues: parsed.error.flatten() }, 400);
    }

    const updated = await updateBriefStatus(c.env, c.req.param('id'), parsed.data.status, auth.normalizedEmail);
    if (!updated) {
      return c.json({ ok: false, error: 'not_found' }, 404);
    }

    const items = await listBriefs(c.env);
    return c.json({ ok: true, data: items });
  });

  return app;
};

const app = createApp();

export default app;
