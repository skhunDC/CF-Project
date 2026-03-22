import app from './server/app';
import type { Env } from './shared/types/env';

const assetPattern = /\.(?:js|css|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/assets/') || assetPattern.test(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    return app.fetch(request, env, ctx);
  },
};
