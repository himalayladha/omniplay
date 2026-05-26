-- ============================================================
-- OmniPlay Migration: Add spotlight_game_id to zon_config
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add the spotlight_game_id column (nullable integer)
ALTER TABLE zon_config
  ADD COLUMN IF NOT EXISTS spotlight_game_id INTEGER DEFAULT NULL;

-- 2. Optional: add a foreign key reference to zon_games
--    (only if you want DB-level integrity, can skip if games are managed loosely)
-- ALTER TABLE zon_config
--   ADD CONSTRAINT fk_spotlight_game
--   FOREIGN KEY (spotlight_game_id) REFERENCES zon_games(id) ON DELETE SET NULL;

-- 3. Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'zon_config'
ORDER BY ordinal_position;
