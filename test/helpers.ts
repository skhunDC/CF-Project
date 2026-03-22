import type { Env } from '../src/shared/types/env';

type BriefRow = {
  id: string;
  customer_name: string;
  service_type: string;
  due_date: string;
  priority: number;
  status: 'new' | 'in_progress' | 'ready';
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

class MockPreparedStatement {
  constructor(private readonly state: MockD1, private readonly query: string, private readonly params: unknown[] = []) {}

  bind(...params: unknown[]) {
    return new MockPreparedStatement(this.state, this.query, params);
  }

  async all<T>() {
    return { results: this.state.executeAll<T>(this.query, this.params) };
  }

  async first<T>() {
    return this.state.executeFirst<T>(this.query, this.params);
  }

  async run() {
    return this.state.executeRun(this.query, this.params);
  }
}

class MockD1 {
  public readonly briefs: BriefRow[];

  constructor(seed: BriefRow[] = []) {
    this.briefs = seed;
  }

  prepare(query: string) {
    return new MockPreparedStatement(this, query);
  }

  executeAll<T>(query: string, params: unknown[]) {
    if (query.includes('FROM service_briefs')) {
      return this.briefs
        .slice()
        .sort((left, right) => {
          const statusOrder = { new: 0, in_progress: 1, ready: 2 };
          return statusOrder[left.status] - statusOrder[right.status] || right.priority - left.priority || left.due_date.localeCompare(right.due_date);
        })
        .map((row) => this.toApiShape(row)) as T[];
    }

    throw new Error(`Unhandled all() query: ${query}`);
  }

  executeFirst<T>(query: string) {
    if (query.includes('COUNT(*) as total')) {
      return {
        total: this.briefs.length,
        newCount: this.briefs.filter((row) => row.status === 'new').length,
        inProgressCount: this.briefs.filter((row) => row.status === 'in_progress').length,
        readyCount: this.briefs.filter((row) => row.status === 'ready').length,
      } as T;
    }

    throw new Error(`Unhandled first() query: ${query}`);
  }

  executeRun(query: string, params: unknown[]) {
    if (query.startsWith('INSERT INTO service_briefs')) {
      const now = '2026-03-22T10:00:00.000Z';
      this.briefs.push({
        id: String(params[0]),
        customer_name: String(params[1]),
        service_type: String(params[2]),
        due_date: String(params[3]),
        priority: Number(params[4]),
        status: 'new',
        notes: String(params[5]),
        created_at: now,
        updated_at: now,
        created_by: String(params[6]),
        updated_by: String(params[6]),
      });
      return Promise.resolve({ meta: { changes: 1 } });
    }

    if (query.startsWith('UPDATE service_briefs')) {
      const row = this.briefs.find((item) => item.id === params[2]);
      if (!row) {
        return Promise.resolve({ meta: { changes: 0 } });
      }
      row.status = params[0] as BriefRow['status'];
      row.updated_by = String(params[1]);
      row.updated_at = '2026-03-22T11:00:00.000Z';
      return Promise.resolve({ meta: { changes: 1 } });
    }

    throw new Error(`Unhandled run() query: ${query}`);
  }

  private toApiShape(row: BriefRow) {
    return {
      id: row.id,
      customerName: row.customer_name,
      serviceType: row.service_type,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const createEnv = (overrides: Partial<Env> = {}): Env => {
  const db = new MockD1([
    {
      id: 'brief-1',
      customer_name: 'Anna Park',
      service_type: 'Dry Cleaning',
      due_date: '2026-03-23',
      priority: 3,
      status: 'new',
      notes: 'Cream coat with same-day promise and spot treatment note.',
      created_at: '2026-03-22T09:00:00.000Z',
      updated_at: '2026-03-22T09:00:00.000Z',
      created_by: 'skhun@dublincleaners.com',
      updated_by: 'skhun@dublincleaners.com',
    },
  ]);

  return {
    APP_NAME: 'Dublin Cleaners Care Desk',
    APP_URL: 'http://localhost:8787',
    BRAND_LOGO_URL: 'https://www.dublincleaners.com/wp-content/uploads/2024/12/Dublin-Logos-stacked.png',
    ACCESS_ALLOWLIST: 'skhun@dublincleaners.com,ss.sku@gmail.com',
    CF_ACCESS_TEAM_DOMAIN: 'team.example.cloudflareaccess.com',
    CF_ACCESS_AUD: 'aud-tag',
    DEV_AUTH_BYPASS: 'true',
    DB: db as unknown as D1Database,
    ASSETS: {
      fetch: async () => new Response('<!doctype html><html><body><div id="root"></div></body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } }),
    } as Fetcher,
    ...overrides,
  };
};
