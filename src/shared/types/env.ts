export interface Env {
  APP_NAME: string;
  APP_URL: string;
  BRAND_LOGO_URL: string;
  ACCESS_ALLOWLIST: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  DEV_AUTH_BYPASS?: string;
  DB: D1Database;
  ASSETS: Fetcher;
}

export interface AuthContext {
  email: string;
  normalizedEmail: string;
  isAuthorized: true;
  source: 'cloudflare-access-jwt' | 'cloudflare-access-header' | 'dev-bypass';
}

export interface CareBrief {
  id: string;
  customerName: string;
  serviceType: 'Dry Cleaning' | 'Wash & Fold' | 'Alterations' | 'Pickup Coordination';
  dueDate: string;
  priority: 1 | 2 | 3;
  status: 'new' | 'in_progress' | 'ready';
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
