-- ============================================================
-- OmniPlay Migration: Set Default game_status to 1
-- Run this to fix legacy 0 status mismatch and set future default
-- ============================================================

-- 1. Update all existing legacy games status to 1 (Active)
UPDATE zon_games SET game_status = 1 WHERE game_status IS NULL OR game_status = 0;

-- 2. Set default value for future inserts to 1 (Active)
ALTER TABLE zon_games ALTER COLUMN game_status SET DEFAULT 1;
