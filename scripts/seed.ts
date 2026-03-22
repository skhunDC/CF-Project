import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const seedSql = `
PRAGMA foreign_keys = ON;
DELETE FROM user_badges;
DELETE FROM badges;
DELETE FROM league_scores;
DELETE FROM league_members;
DELETE FROM leagues;
DELETE FROM catch_verifications;
DELETE FROM catch_photos;
DELETE FROM catches;
DELETE FROM weather_snapshots;
DELETE FROM sessions;
DELETE FROM auth_accounts;
DELETE FROM user_relationships;
DELETE FROM mission_progress;
DELETE FROM missions;
DELETE FROM moderation_flags;
DELETE FROM waters;
DELETE FROM species;
DELETE FROM users;

INSERT INTO users (id, email, display_name, handle, home_region, favorite_species, role, created_at, updated_at) VALUES
('user_demo_1', 'mara@example.com', 'Mara Lane', 'maracasts', 'Tampa Bay', 'Snook', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user_demo_2', 'ellis@example.com', 'Ellis Ray', 'ellisreels', 'Tampa Bay', 'Redfish', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user_admin', 'captain@example.com', 'Captain Ops', 'captainops', 'Florida Gulf', 'Tarpon', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO species (id, name, slug, category, created_at) VALUES
('sp_snook', 'Snook', 'snook', 'inshore', CURRENT_TIMESTAMP),
('sp_redfish', 'Redfish', 'redfish', 'inshore', CURRENT_TIMESTAMP),
('sp_bass', 'Largemouth Bass', 'largemouth-bass', 'freshwater', CURRENT_TIMESTAMP),
('sp_trout', 'Speckled Trout', 'speckled-trout', 'inshore', CURRENT_TIMESTAMP);

INSERT INTO waters (id, name, region, state_code, lat, lng, water_type, created_at) VALUES
('water_1', 'Old Tampa Bay', 'Tampa Bay', 'FL', 27.98, -82.56, 'bay', CURRENT_TIMESTAMP),
('water_2', 'Caloosahatchee River', 'Southwest Florida', 'FL', 26.64, -81.86, 'river', CURRENT_TIMESTAMP),
('water_3', 'Lake Tohopekaliga', 'Central Florida', 'FL', 28.27, -81.42, 'lake', CURRENT_TIMESTAMP);

INSERT INTO catches (id, user_id, species_id, water_id, length_in, weight_lb, lure, notes, private_lat, private_lng, public_lat, public_lng, public_geohash_zone, verification_status, caught_at, created_at, updated_at) VALUES
('catch_1', 'user_demo_1', 'sp_snook', 'water_1', 31, 11.4, 'Paddle tail', 'Ambush line on a moving tide.', 27.9802, -82.5614, 27.98, -82.56, '27.98:-82.56', 'verified', datetime('now', '-2 hours'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('catch_2', 'user_demo_2', 'sp_redfish', 'water_1', 29, 9.2, 'Gold spoon', 'School pushed bait onto the flat.', 27.9810, -82.5532, 27.98, -82.55, '27.98:-82.55', 'verified', datetime('now', '-5 hours'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('catch_3', 'user_demo_1', 'sp_bass', 'water_3', 22, 6.8, 'Black worm', 'Brush pile edge bite.', 28.2703, -81.4201, 28.27, -81.42, '28.27:-81.42', 'pending', datetime('now', '-1 day'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO catch_photos (id, catch_id, original_key, variant_url, is_primary, created_at) VALUES
('photo_1', 'catch_1', 'demo/snook.jpg', 'https://imagedelivery.net/demo/snook', 1, CURRENT_TIMESTAMP),
('photo_2', 'catch_2', 'demo/redfish.jpg', 'https://imagedelivery.net/demo/redfish', 1, CURRENT_TIMESTAMP),
('photo_3', 'catch_3', 'demo/bass.jpg', 'https://imagedelivery.net/demo/bass', 1, CURRENT_TIMESTAMP);

INSERT INTO catch_verifications (id, catch_id, exif_timestamp_match, gps_match, device_confidence, reviewer_notes, created_at) VALUES
('verify_1', 'catch_1', 1, 1, 0.97, 'All signals align.', CURRENT_TIMESTAMP),
('verify_2', 'catch_2', 1, 1, 0.93, 'Reliable geo/time pair.', CURRENT_TIMESTAMP);

INSERT INTO weather_snapshots (id, region, wind_mph, cloud_cover, pressure_trend, moon_phase, temp_delta, observed_at) VALUES
('wx_1', 'Tampa Bay', 9, 58, 'falling', 0.48, 1.2, CURRENT_TIMESTAMP),
('wx_2', 'Florida Gulf', 7, 40, 'steady', 0.62, 0.4, CURRENT_TIMESTAMP);

INSERT INTO leagues (id, name, scope, metric, region, state_code, species_id, description, created_at) VALUES
('league_local', 'Tampa Inshore Clash', 'local', 'mixed', 'Tampa Bay', 'FL', NULL, 'Daily local competition across all inshore species.', CURRENT_TIMESTAMP),
('league_species', 'Florida Snook Ladder', 'state', 'biggest_fish', 'Florida', 'FL', 'sp_snook', 'Statewide snook-only leaderboard.', CURRENT_TIMESTAMP),
('league_friends', 'Crew Numbers Race', 'friends', 'most_fish', 'Tampa Bay', 'FL', NULL, 'Private friends leaderboard for volume.', CURRENT_TIMESTAMP);

INSERT INTO league_members (id, league_id, user_id, role, joined_at) VALUES
('lm_1', 'league_local', 'user_demo_1', 'member', CURRENT_TIMESTAMP),
('lm_2', 'league_local', 'user_demo_2', 'member', CURRENT_TIMESTAMP),
('lm_3', 'league_species', 'user_demo_1', 'member', CURRENT_TIMESTAMP),
('lm_4', 'league_friends', 'user_demo_1', 'member', CURRENT_TIMESTAMP),
('lm_5', 'league_friends', 'user_demo_2', 'member', CURRENT_TIMESTAMP);

INSERT INTO league_scores (id, league_id, user_id, score, updated_at) VALUES
('ls_1', 'league_local', 'user_demo_1', 71, CURRENT_TIMESTAMP),
('ls_2', 'league_local', 'user_demo_2', 66, CURRENT_TIMESTAMP),
('ls_3', 'league_species', 'user_demo_1', 54, CURRENT_TIMESTAMP),
('ls_4', 'league_friends', 'user_demo_1', 20, CURRENT_TIMESTAMP),
('ls_5', 'league_friends', 'user_demo_2', 10, CURRENT_TIMESTAMP);

INSERT INTO badges (id, name, description, icon, created_at) VALUES
('badge_verified', 'Verified Stick', 'Log a catch with strong proof signals.', 'shield-check', CURRENT_TIMESTAMP),
('badge_dawn', 'Dawn Raider', 'Land a fish during a prime sunrise window.', 'sunrise', CURRENT_TIMESTAMP);

INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES
('ub_1', 'user_demo_1', 'badge_verified', CURRENT_TIMESTAMP),
('ub_2', 'user_demo_1', 'badge_dawn', CURRENT_TIMESTAMP);
`;

const dir = await mkdtemp(join(tmpdir(), 'ccp-seed-'));
const file = join(dir, 'seed.sql');
await writeFile(file, seedSql, 'utf8');
execSync(`npx wrangler d1 execute DB --local --file=${file}`, { stdio: 'inherit' });
