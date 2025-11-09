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
  black: number;      // Mr. X only - can use any transport
  doubleMove: number; // Mr. X only - move twice in one turn
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
  // Double move tracking (Mr. X only)
  isDoubleMoveActive?: boolean; // True when Mr. X is using a double move
  doubleMoveFirstMove?: {       // Details of the first move in a double move
    from: number;
    to: number;
    transport: TransportType;
  } | null;
}

/**
 * Default ticket counts for detectives
 * According to official Scotland Yard rules
 */
export const DEFAULT_DETECTIVE_TICKETS: TicketCounts = {
  taxi: 11,
  bus: 8,
  underground: 4,
  water: 0,       // Detectives don't have water tickets
  black: 0,       // Detectives don't have black tickets
  doubleMove: 0,  // Detectives don't have double move cards
};

/**
 * Default ticket counts for Mr. X
 * According to official Scotland Yard rules:
 * - Starts with limited regular tickets (4 taxi, 3 bus, 3 underground)
 * - Has 5 black tickets (can use any transport)
 * - Has 2 double move cards
 * - Collects used tickets from detectives as the game progresses
 */
export const DEFAULT_MR_X_TICKETS: TicketCounts = {
  taxi: 4,
  bus: 3,
  underground: 3,
  water: 0,       // Water not used in standard game
  black: 5,       // Black tickets can use any transport
  doubleMove: 2,  // Can move twice in one turn
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
