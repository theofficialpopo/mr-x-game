-- Add is_revealed column to moves table for double move tracking
ALTER TABLE moves
ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN NOT NULL DEFAULT FALSE;
