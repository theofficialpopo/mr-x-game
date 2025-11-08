-- Scotland Yard Game Database Schema for Neon (Postgres)

-- Games table - stores active and completed games
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(6) PRIMARY KEY,
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('waiting', 'playing', 'finished')),
  current_player_index INTEGER NOT NULL DEFAULT 0,
  round INTEGER NOT NULL DEFAULT 1,
  mr_x_last_revealed_position INTEGER,
  winner VARCHAR(20) CHECK (winner IN ('mr-x', 'detectives')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Players table - stores player information for games
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(50) PRIMARY KEY,
  game_id VARCHAR(6) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('mr-x', 'detective')),
  position INTEGER NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  is_stuck BOOLEAN NOT NULL DEFAULT FALSE,
  tickets JSONB NOT NULL DEFAULT '{}'::jsonb,
  player_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Move history table - stores all moves made in games
CREATE TABLE IF NOT EXISTS moves (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(6) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id VARCHAR(50) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  from_station INTEGER NOT NULL,
  to_station INTEGER NOT NULL,
  transport VARCHAR(20) NOT NULL,
  round INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_games_updated_at ON games(updated_at);
