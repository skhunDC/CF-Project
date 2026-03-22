import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { CareBrief } from '../shared/types/env';

type SessionPayload = {
  auth: {
    normalizedEmail: string;
    source: string;
  };
  metrics: {
    total: number;
    newCount: number;
    inProgressCount: number;
    readyCount: number;
  };
};

type CreateBriefState = {
  customerName: string;
  serviceType: CareBrief['serviceType'];
  dueDate: string;
  priority: '1' | '2' | '3';
  notes: string;
};

const initialForm: CreateBriefState = {
  customerName: '',
  serviceType: 'Dry Cleaning',
  dueDate: new Date().toISOString().slice(0, 10),
  priority: '2',
  notes: '',
};

const groupTitle: Record<CareBrief['status'], string> = {
  new: 'Incoming',
  in_progress: 'In progress',
  ready: 'Ready for handoff',
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const json = (await response.json()) as { ok?: boolean; data?: T; message?: string; error?: string };
  if (!response.ok || !json.ok) {
    throw new Error(json.message ?? json.error ?? 'Request failed');
  }
  return json.data as T;
}

export const App = () => {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [briefs, setBriefs] = useState<CareBrief[]>([]);
  const [form, setForm] = useState<CreateBriefState>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(
    () => ({
      new: briefs.filter((item) => item.status === 'new'),
      in_progress: briefs.filter((item) => item.status === 'in_progress'),
      ready: briefs.filter((item) => item.status === 'ready'),
    }),
    [briefs],
  );

  useEffect(() => {
    void Promise.all([fetchJson<SessionPayload>('/api/session'), fetchJson<CareBrief[]>('/api/briefs')])
      .then(([sessionData, briefData]) => {
        setSession(sessionData);
        setBriefs(briefData);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load workspace.');
      });
  }, []);

  const submitBrief = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const next = await fetchJson<CareBrief[]>('/api/briefs', {
        method: 'POST',
        body: JSON.stringify({
          customerName: form.customerName,
          serviceType: form.serviceType,
          dueDate: form.dueDate,
          priority: Number(form.priority),
          notes: form.notes,
        }),
      });
      setBriefs(next);
      setForm({ ...initialForm, dueDate: form.dueDate });
      const sessionData = await fetchJson<SessionPayload>('/api/session');
      setSession(sessionData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create service brief.');
    } finally {
      setBusy(false);
    }
  };

  const moveBrief = async (id: string, status: CareBrief['status']) => {
    setBusy(true);
    setError(null);
    try {
      const next = await fetchJson<CareBrief[]>(`/api/briefs/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setBriefs(next);
      const sessionData = await fetchJson<SessionPayload>('/api/session');
      setSession(sessionData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update service brief.');
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return (
      <main className="app-shell">
        <section className="hero-card loading-state">
          <p className="eyebrow">Loading secure workspace</p>
          <h1>Preparing the Dublin Cleaners Care Desk…</h1>
          {error ? <p className="supporting-line">{error}</p> : <p className="supporting-line">Validating server-side access control and loading the current service queue.</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card reveal">
        <div className="brand-block">
          <img className="brand-logo" src="https://www.dublincleaners.com/wp-content/uploads/2024/12/Dublin-Logos-stacked.png" alt="Dublin Cleaners" />
          <div>
            <p className="eyebrow">Private staff workspace</p>
            <h1>Move every garment handoff forward from one calm, secure desk.</h1>
            <p className="supporting-line">Log service briefs, keep due dates visible, and coordinate premium pickup readiness without exposing anything outside the Access allowlist.</p>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit" />
          <div className="visual-card glass">
            <strong>{session.metrics.total} active briefs</strong>
            <span>{session.metrics.newCount} incoming · {session.metrics.inProgressCount} in progress · {session.metrics.readyCount} ready</span>
            <small>Signed in as {session.auth.normalizedEmail}</small>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="panel reveal delay-1">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Primary CTA</p>
              <h2>Log a new service brief</h2>
            </div>
          </div>
          <form className="brief-form" onSubmit={submitBrief}>
            <label>
              <span>Customer name</span>
              <input value={form.customerName} onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))} placeholder="e.g. Sarah Kim" required minLength={2} />
            </label>
            <label>
              <span>Service type</span>
              <select value={form.serviceType} onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value as CareBrief['serviceType'] }))}>
                <option>Dry Cleaning</option>
                <option>Wash & Fold</option>
                <option>Alterations</option>
                <option>Pickup Coordination</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                <span>Due date</span>
                <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} required />
              </label>
              <label>
                <span>Priority</span>
                <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as CreateBriefState['priority'] }))}>
                  <option value="1">Standard</option>
                  <option value="2">Priority</option>
                  <option value="3">Rush</option>
                </select>
              </label>
            </div>
            <label>
              <span>Care note</span>
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Share stain treatment context, promised pickup timing, or garment-specific handling details." required minLength={10} />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save service brief'}</button>
            {error ? <p className="error-text">{error}</p> : null}
          </form>
        </article>

        <article className="panel reveal delay-2">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Protected queue</p>
              <h2>Today’s service flow</h2>
            </div>
          </div>
          <div className="queue-columns">
            {(Object.keys(grouped) as CareBrief['status'][]).map((status) => (
              <section key={status} className="queue-column">
                <header>
                  <h3>{groupTitle[status]}</h3>
                  <span>{grouped[status].length}</span>
                </header>
                <div className="queue-items">
                  {grouped[status].length ? (
                    grouped[status].map((brief) => (
                      <article className="brief-card glass" key={brief.id}>
                        <div className="brief-meta">
                          <strong>{brief.customerName}</strong>
                          <span>Due {brief.dueDate}</span>
                        </div>
                        <p>{brief.serviceType} · Priority {brief.priority}</p>
                        <small>{brief.notes}</small>
                        <footer>
                          <span>{brief.updatedBy}</span>
                          <div className="brief-actions">
                            {brief.status !== 'new' ? <button type="button" onClick={() => moveBrief(brief.id, 'new')} disabled={busy}>Mark incoming</button> : null}
                            {brief.status !== 'in_progress' ? <button type="button" onClick={() => moveBrief(brief.id, 'in_progress')} disabled={busy}>Start</button> : null}
                            {brief.status !== 'ready' ? <button type="button" onClick={() => moveBrief(brief.id, 'ready')} disabled={busy}>Ready</button> : null}
                          </div>
                        </footer>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state glass">No items here right now.</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};
