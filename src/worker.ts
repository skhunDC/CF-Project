import app from './server/app';
import { consumeCatchEvents } from './server/queues/catch-events';
import { LeaderboardRoom } from './server/services/leaderboard-room';
import type { Env } from './shared/types/env';

export { LeaderboardRoom };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname === '/health') {
      return app.fetch(request, env, ctx);
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }
  },
  queue: consumeCatchEvents,
};
