import type { TransportType } from './board';

/**
 * Player roles in Scotland Yard
 */
export type PlayerRole = 'mr-x' | 'detective';

/**
 * Game phase/state
 */
export type GamePhase = 'setup' | 'playing' | 'finished';

/**
 * Ticket counts for a player
 */
export interface TicketCounts {
  taxi: number;
  bus: number;
  underground: number;
  water: number;
}

/**
 * Player state in the game
 */
export interface Player {
  id: string;
  playerUUID?: string; // UUID for session-based reconnection
  name: string;
  role: PlayerRole;
  position: number; // Current station ID
  tickets: TicketCounts;
  isRevealed?: boolean; // For Mr. X - whether position is currently revealed
}

/**
 * A single move in the game
 */
export interface Move {
  playerId: string;
  playerName: string;
  playerRole: PlayerRole;
  role: PlayerRole; // Alias for playerRole for backward compatibility
  from: number;
  to: number;
  transport: TransportType;
  round: number;
  timestamp: number;
  isRevealed?: boolean; // For Mr. X moves - whether this was a reveal round
}

/**
 * Win conditions
 */
export type WinCondition = 'mr-x-captured' | 'detectives-stuck' | 'mr-x-survived';

/**
 * Game result
 */
export interface GameResult {
  winner: 'mr-x' | 'detectives';
  condition: WinCondition;
  finalRound: number;
}

/**
 * Complete game state
 */
export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  round: number; // Current round (1-24)
  moveHistory: Move[];
  revealRounds: number[]; // Rounds when Mr. X position is revealed
  winner: 'mr-x' | 'detectives' | null;
  result?: GameResult;
}

/**
 * Default ticket counts for detectives
 * According to Scotland Yard rules
 */
export const DEFAULT_DETECTIVE_TICKETS: TicketCounts = {
  taxi: 11,
  bus: 8,
  underground: 4,
  water: 0, // Detectives don't have water tickets
};

/**
 * Default ticket counts for Mr. X
 * Mr. X has unlimited tickets except water
 */
export const DEFAULT_MR_X_TICKETS: TicketCounts = {
  taxi: 999,
  bus: 999,
  underground: 999,
  water: 2,
};

/**
 * Rounds when Mr. X must reveal position
 */
export const MR_X_REVEAL_ROUNDS = [3, 8, 13, 18, 24];

/**
 * Maximum number of rounds in a game
 */
export const MAX_ROUNDS = 24;

/**
 * Starting positions for players
 * These are the official starting positions from the board game
 */
export const STARTING_POSITIONS = {
  mrX: [35, 45, 51, 71, 78, 104, 106, 127, 132, 146, 166, 170, 172],
  detectives: [13, 26, 29, 34, 50, 53, 91, 94, 103, 112, 117, 123, 138, 141, 155, 174, 197, 198],
};
