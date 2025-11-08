import type { Player, GamePhase, GameState } from './game';
import type { TransportType } from './board';

/**
 * Client -> Server Events
 */
export interface ClientToServerEvents {
  // Lobby management
  'lobby:create': (playerName: string, playerUUID: string, callback: (response: CreateGameResponse) => void) => void;
  'lobby:join': (gameId: string, playerName: string, playerUUID: string, callback: (response: JoinGameResponse) => void) => void;
  'lobby:leave': (callback: () => void) => void;
  'lobby:ready': (isReady: boolean) => void;
  'lobby:start': () => void;

  // Game actions
  'game:move': (stationId: number, transport: TransportType, callback: (response: MoveResponse) => void) => void;
  'game:surrender': () => void;

  // Rematch
  'rematch:ready': (isReady: boolean) => void;
}

/**
 * Server -> Client Events
 */
export interface ServerToClientEvents {
  // Lobby updates
  'lobby:updated': (lobby: LobbyState) => void;
  'lobby:error': (error: string) => void;

  // Game state updates
  'game:state': (state: ClientGameState) => void;
  'game:move:made': (move: MoveNotification) => void;
  'game:round:complete': (round: number) => void;
  'game:ended': (result: GameEndResult) => void;
  'game:error': (error: string) => void;

  // Rematch
  'rematch:ready:updated': (readyPlayers: string[]) => void;
}

/**
 * Lobby state
 */
export interface LobbyState {
  gameId: string;
  players: LobbyPlayer[];
  hostId: string;
  phase: 'waiting' | 'ready' | 'starting';
  maxPlayers: number;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  role?: 'mr-x' | 'detective';
  isReady: boolean;
  isHost: boolean;
}

/**
 * Client-safe game state (Mr. X position filtered for detectives)
 */
export interface ClientGameState {
  gameId: string;
  phase: GamePhase;
  round: number;
  currentPlayerIndex: number;
  players: Player[]; // Mr. X position filtered if not revealed
  revealRounds: number[];
  isMrXRevealed: boolean;
  winner: 'mr-x' | 'detectives' | null;
}

/**
 * Move notification sent to all players
 */
export interface MoveNotification {
  playerId: string;
  playerName: string;
  role: 'mr-x' | 'detective';
  stationId: number | null; // null for Mr. X when not revealed
  transport: TransportType;
  round: number;
  timestamp: number;
}

/**
 * Game end result
 */
export interface GameEndResult {
  winner: 'mr-x' | 'detectives';
  reason: 'mr-x-escaped' | 'mr-x-caught' | 'mr-x-stuck' | 'detectives-stuck' | 'surrender';
  finalPositions: Map<string, number>;
}

/**
 * Response types
 */
export interface CreateGameResponse {
  success: boolean;
  gameId?: string;
  playerId?: string;
  error?: string;
}

export interface JoinGameResponse {
  success: boolean;
  playerId?: string;
  lobby?: LobbyState;
  error?: string;
}

export interface MoveResponse {
  success: boolean;
  error?: string;
}
