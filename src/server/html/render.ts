import type { AuthContext, Env } from '../../shared/types/env';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const pageShell = ({ title, body, logoUrl }: { title: string; body: string; logoUrl: string }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0d5f4c" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --bg: #061612;
        --surface: rgba(7, 41, 33, 0.82);
        --surface-strong: rgba(255, 255, 255, 0.08);
        --text: #f5f6f1;
        --muted: #bfd7cb;
        --line: rgba(255, 255, 255, 0.12);
        --accent: #0d5f4c;
        --accent-soft: #1b8a6b;
        --glow: rgba(31, 153, 118, 0.24);
        color-scheme: dark;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(27, 138, 107, 0.3), transparent 35%),
          linear-gradient(160deg, #04100d 0%, #08231d 48%, #051512 100%);
      }
      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .panel {
        width: min(100%, 720px);
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: 28px;
        background: linear-gradient(180deg, rgba(7, 41, 33, 0.94), rgba(7, 24, 20, 0.88));
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255,255,255,0.03) inset;
      }
      .logo { width: 144px; max-width: 40vw; }
      .eyebrow {
        display: inline-flex;
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--surface-strong);
        color: var(--muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 12px;
      }
      h1 { font-size: clamp(2rem, 6vw, 4rem); margin: 18px 0 12px; line-height: 0.96; }
      p { margin: 0; color: var(--muted); font-size: 1.05rem; line-height: 1.6; }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 18px;
        border-radius: 999px;
        border: 1px solid transparent;
        background: linear-gradient(135deg, var(--accent), var(--accent-soft));
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
      .button.secondary { background: transparent; border-color: var(--line); color: var(--text); }
      .grid {
        display: grid;
        gap: 16px;
        margin-top: 26px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 18px;
        background: rgba(255,255,255,0.03);
      }
      .list { margin: 14px 0 0; padding-left: 18px; color: var(--muted); }
      .list li + li { margin-top: 10px; }
      @media (min-width: 768px) {
        .grid { grid-template-columns: 1.15fr 0.85fr; align-items: end; }
        .panel { padding: 40px; }
      }
    </style>
  </head>
  <body>
    <main>${body.replaceAll('__LOGO_URL__', escapeHtml(logoUrl))}</main>
  </body>
</html>`;

export const renderLandingPage = (env: Env) =>
  pageShell({
    title: env.APP_NAME,
    logoUrl: env.BRAND_LOGO_URL,
    body: `
      <section class="panel">
        <span class="eyebrow">Private staff workflow</span>
        <div class="grid">
          <div>
            <img class="logo" src="__LOGO_URL__" alt="Dublin Cleaners logo" />
            <h1>Keep every premium garment handoff crisp, visible, and on schedule.</h1>
            <p>Care Desk is the private Dublin Cleaners operations board for urgent garment notes, same-day due dates, and pickup coordination across the team.</p>
            <div class="actions">
              <a class="button" href="/app">Open Care Desk</a>
              <a class="button secondary" href="https://www.dublincleaners.com" target="_blank" rel="noreferrer">Visit Dublin Cleaners</a>
            </div>
          </div>
          <aside class="card" aria-label="Care Desk preview">
            <strong>One focused workflow</strong>
            <ul class="list">
              <li>Cloudflare Access gates the app before any protected UI is sent.</li>
              <li>D1 keeps service briefs durable with server-side audit fields.</li>
              <li>Only approved staff emails can open the protected workspace.</li>
            </ul>
          </aside>
        </div>
      </section>
    `,
  });

export const renderUnauthorizedPage = (env: Env) =>
  pageShell({
    title: `${env.APP_NAME} · Unauthorized`,
    logoUrl: env.BRAND_LOGO_URL,
    body: `
      <section class="panel">
        <span class="eyebrow">Unauthorized</span>
        <img class="logo" src="__LOGO_URL__" alt="Dublin Cleaners logo" />
        <h1>This Care Desk workspace is reserved for approved Dublin Cleaners staff.</h1>
        <p>Your identity was not allowed to access the protected workspace. Confirm that Cloudflare Access is enabled for this application and that your email is in the server-side allowlist.</p>
        <div class="actions">
          <a class="button" href="/">Return to landing page</a>
        </div>
      </section>
    `,
  });

export const jsonUnauthorized = () =>
  Response.json(
    {
      ok: false,
      error: 'forbidden',
      message: 'Your Cloudflare Access identity is not authorized for this application.',
    },
    { status: 403 },
  );

export const renderAppShellBlocked = (env: Env) =>
  new Response(renderUnauthorizedPage(env), {
    status: 403,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

export const renderBootstrapHeaders = (auth: AuthContext) =>
  ({
    'x-authenticated-email': auth.normalizedEmail,
  });
