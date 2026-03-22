PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  home_region TEXT NOT NULL,
  favorite_species TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE auth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE waters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  state_code TEXT NOT NULL,
  lat REAL,
  lng REAL,
  water_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE species (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE catches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  species_id TEXT NOT NULL,
  water_id TEXT,
  length_in REAL NOT NULL,
  weight_lb REAL NOT NULL,
  lure TEXT,
  notes TEXT,
  private_lat REAL NOT NULL,
  private_lng REAL NOT NULL,
  public_lat REAL NOT NULL,
  public_lng REAL NOT NULL,
  public_geohash_zone TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  caught_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES species(id),
  FOREIGN KEY (water_id) REFERENCES waters(id)
);

CREATE TABLE catch_photos (
  id TEXT PRIMARY KEY,
  catch_id TEXT NOT NULL,
  original_key TEXT NOT NULL,
  variant_url TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (catch_id) REFERENCES catches(id) ON DELETE CASCADE
);

CREATE TABLE catch_verifications (
  id TEXT PRIMARY KEY,
  catch_id TEXT NOT NULL,
  exif_timestamp_match INTEGER NOT NULL DEFAULT 0,
  gps_match INTEGER NOT NULL DEFAULT 0,
  device_confidence REAL NOT NULL DEFAULT 0,
  reviewer_notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (catch_id) REFERENCES catches(id) ON DELETE CASCADE
);

CREATE TABLE leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scope TEXT NOT NULL,
  metric TEXT NOT NULL,
  region TEXT,
  state_code TEXT,
  species_id TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE league_members (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(league_id, user_id)
);

CREATE TABLE league_scores (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  score REAL NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(league_id, user_id)
);

CREATE TABLE bite_scores (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  species_id TEXT,
  score INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  why_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE weather_snapshots (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  wind_mph REAL NOT NULL,
  cloud_cover REAL NOT NULL,
  pressure_trend TEXT NOT NULL,
  moon_phase REAL NOT NULL,
  temp_delta REAL NOT NULL,
  observed_at TEXT NOT NULL
);

CREATE TABLE missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  species_id TEXT,
  target_count INTEGER NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE mission_progress (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  progress_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(mission_id, user_id)
);

CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE(user_id, badge_id)
);

CREATE TABLE user_relationships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  related_user_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, related_user_id, relationship_type)
);

CREATE TABLE moderation_flags (
  id TEXT PRIMARY KEY,
  catch_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (catch_id) REFERENCES catches(id) ON DELETE CASCADE
);

CREATE INDEX idx_catches_user_id ON catches(user_id);
CREATE INDEX idx_catches_species_id ON catches(species_id);
CREATE INDEX idx_catches_public_zone ON catches(public_geohash_zone);
CREATE INDEX idx_league_scores_league_id ON league_scores(league_id, score DESC);
CREATE INDEX idx_bite_scores_region ON bite_scores(region, created_at DESC);
