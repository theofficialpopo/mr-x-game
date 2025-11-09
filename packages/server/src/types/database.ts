/**
 * Database types for type-safe query results
 *
 * Note: Column names are in camelCase due to postgres.js transform configuration
 * (snake_case database columns are automatically converted to camelCase)
 */

/**
 * Game record from the database
 */
export interface DBGame {
  id: string;
  phase: 'waiting' | 'playing' | 'finished';
  currentPlayerIndex: number;
  round: number;
  mrXLastRevealedPosition: number | null;
  winner: 'mr-x' | 'detectives' | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player record from the database
 */
export interface DBPlayer {
  id: string;
  playerUuid: string | null;
  gameId: string;
  name: string;
  role: 'mr-x' | 'detective' | null;
  position: number;
  isHost: boolean;
  isReady: boolean;
  isStuck: boolean;
  tickets: Record<string, number> | string; // Can be object or JSON string
  playerOrder: number;
  createdAt: Date;
}

/**
 * Move record from the database
 */
export interface DBMove {
  id: number;
  gameId: string;
  playerId: string;
  playerName: string;
  role: 'mr-x' | 'detective';
  fromStation: number;
  toStation: number;
  transport: string;
  round: number;
  timestamp: number | string; // Can be bigint or string
  createdAt: Date;
}
