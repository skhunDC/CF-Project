import { describe, expect, it } from 'vitest';
import { createApp } from '../src/server/app';
import { createEnv } from './helpers';

describe('protected route behavior', () => {
  it('returns branded unauthorized html for /app', async () => {
    const app = createApp();
    const env = createEnv({ DEV_AUTH_BYPASS: 'false' });

    const response = await app.request('/app', {}, env, {} as ExecutionContext);
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain('Unauthorized');
    expect(body).not.toContain('<div id="root"></div>');
  });

  it('returns 403 json for unauthorized api requests', async () => {
    const app = createApp();
    const env = createEnv({ DEV_AUTH_BYPASS: 'false' });

    const response = await app.request('/api/briefs', {}, env, {} as ExecutionContext);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('forbidden');
  });

  it('serves authorized data and supports writes', async () => {
    const app = createApp();
    const env = createEnv();
    const headers = { 'x-dev-auth-email': 'ss.sku@gmail.com' };

    const listResponse = await app.request('/api/briefs', { headers }, env, {} as ExecutionContext);
    expect(listResponse.status).toBe(200);

    const createResponse = await app.request(
      '/api/briefs',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: 'Marcus Lee',
          serviceType: 'Alterations',
          dueDate: '2026-03-24',
          priority: 3,
          notes: 'Suit sleeve adjustment promised before Thursday pickup.',
        }),
      },
      env,
      {} as ExecutionContext,
    );

    expect(createResponse.status).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.data).toHaveLength(2);

    const statusResponse = await app.request(
      '/api/briefs/brief-1/status',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: 'ready' }),
      },
      env,
      {} as ExecutionContext,
    );

    expect(statusResponse.status).toBe(200);
    const statusBody = await statusResponse.json();
    expect(statusBody.data.find((item: { id: string; status: string }) => item.id === 'brief-1')?.status).toBe('ready');
  });
});
