export interface Env {
  APP_NAME: string;
  APP_URL: string;
  COOKIE_NAME: string;
  PUBLIC_MAP_BLUR_RADIUS_METERS: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;
  MAGIC_LINK_FROM_EMAIL: string;
  SESSION_SECRET: string;
  QUEUE_WEBHOOK_SECRET: string;
  DB: D1Database;
  ASSETS: Fetcher;
  CATCH_UPLOADS: R2Bucket;
  IMAGES: ImagesBinding;
  CATCH_EVENTS_QUEUE: Queue;
  LEADERBOARD_ROOM: DurableObjectNamespace;
}

export interface AppVariables {
  session: SessionPayload | null;
  user: AppUser | null;
}

export interface SessionPayload {
  sessionId: string;
  userId: string;
  role: 'user' | 'admin';
}

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  homeRegion: string;
  favoriteSpecies: string | null;
  role: 'user' | 'admin';
}
