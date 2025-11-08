-- Migration: Add player_uuid column to players table
-- Date: 2025-01-08
-- Description: Adds player_uuid column to support session-based reconnection

ALTER TABLE players ADD COLUMN IF NOT EXISTS player_uuid VARCHAR(36);
