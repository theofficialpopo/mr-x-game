-- Add double move tracking columns to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS is_double_move_active BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE games
ADD COLUMN IF NOT EXISTS double_move_first_move JSONB;
