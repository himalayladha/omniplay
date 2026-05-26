-- ============================================================
-- Alter zon_games.game_banner_url to allow NULL and set default
-- ============================================================

-- 1. Drop NOT NULL constraint on game_banner_url
ALTER TABLE zon_games ALTER COLUMN game_banner_url DROP NOT NULL;

-- 2. Set default value for game_banner_url to empty string
ALTER TABLE zon_games ALTER COLUMN game_banner_url SET DEFAULT '';
