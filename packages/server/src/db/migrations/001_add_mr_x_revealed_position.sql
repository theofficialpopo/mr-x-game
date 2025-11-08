-- Migration: Add mr_x_last_revealed_position column
-- This column tracks Mr. X's position at the start of reveal rounds
-- so detectives see where he was, not where he moves during the round

ALTER TABLE games ADD COLUMN IF NOT EXISTS mr_x_last_revealed_position INTEGER;
