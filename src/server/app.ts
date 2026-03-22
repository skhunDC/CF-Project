import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { Env } from '../shared/types/env';
import { sessionMiddleware } from './middleware/session';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/api/me';
import { catchesRoutes } from './routes/api/catches';
import { feedRoutes } from './routes/api/feed';
import { mapRoutes } from './routes/api/map';
import { leaguesRoutes } from './routes/api/leagues';
import { biteRoutes } from './routes/api/bite';
import { adminRoutes } from './routes/api/admin';

export const app = new Hono<{ Bindings: Env; Variables: { user: any } }>();

app.use('*', logger(), cors({ origin: '*', credentials: true }), sessionMiddleware);

app.get('/health', (c) => c.json({ ok: true, app: c.env.APP_NAME }));
app.route('/auth', authRoutes);
app.route('/api/me', meRoutes);
app.route('/api/catches', catchesRoutes);
app.route('/api/feed', feedRoutes);
app.route('/api/map', mapRoutes);
app.route('/api/leagues', leaguesRoutes);
app.route('/api/bite', biteRoutes);
app.route('/api/admin', adminRoutes);

export default app;
