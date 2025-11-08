// Types
export type { Station, Connection, TransportType, BoardData } from './types/board';
export type {
  PlayerRole,
  GamePhase,
  TicketCounts,
  Player,
  Move,
  WinCondition,
  GameResult,
  GameState
} from './types/game';
export type {
  ClientToServerEvents,
  ServerToClientEvents,
  LobbyState,
  LobbyPlayer,
  ClientGameState,
  MoveNotification,
  GameEndResult,
  CreateGameResponse,
  JoinGameResponse,
  MoveResponse
} from './types/socket';
export {
  DEFAULT_DETECTIVE_TICKETS,
  DEFAULT_MR_X_TICKETS,
  MR_X_REVEAL_ROUNDS,
  MAX_ROUNDS,
  STARTING_POSITIONS
} from './types/game';

// Data parsing
export { parseStations, parseConnections, parseBoardData, validateBoardData } from './data/parser';

// Game logic
export { Board } from './game-logic/Board';
export { CoordinateMapper } from './game-logic/CoordinateMapper';
export {
  validateMove,
  hasTicket,
  getValidMovesForPlayer,
  hasValidMoves,
  areAllDetectivesStuck,
  isMrXCaptured
} from './game-logic/validation';
export type { ValidationResult } from './game-logic/validation';
