import { describe, expect, it } from 'vitest';
import { getAuthContext, normalizeEmail, parseAllowlist } from '../src/server/auth/access';
import { createEnv } from './helpers';

describe('access auth helpers', () => {
  it('normalizes and parses allowlist values', () => {
    expect(normalizeEmail('  SS.SKU@GMAIL.COM ')).toBe('ss.sku@gmail.com');
    expect(parseAllowlist(' skhun@dublincleaners.com, SS.SKU@GMAIL.COM ').has('ss.sku@gmail.com')).toBe(true);
  });

  it('authorizes an allowlisted dev bypass email', async () => {
    const env = createEnv();
    const request = new Request('http://localhost/api/briefs', {
      headers: { 'x-dev-auth-email': 'skhun@dublincleaners.com' },
    });

    await expect(getAuthContext(request, env)).resolves.toMatchObject({
      normalizedEmail: 'skhun@dublincleaners.com',
      source: 'dev-bypass',
    });
  });

  it('rejects non-allowlisted identities', async () => {
    const env = createEnv();
    const request = new Request('http://localhost/api/briefs', {
      headers: { 'x-dev-auth-email': 'blocked@example.com' },
    });

    await expect(getAuthContext(request, env)).resolves.toBeNull();
  });
});
