import { create } from 'zustand';
import type {
  Player,
  GamePhase,
} from '@shared/types/game';
import type { TransportType } from '@shared/types/board';
import type { ClientGameState } from '@shared/types/socket';
import {
  MR_X_REVEAL_ROUNDS,
  getValidMovesForPlayer,
} from '@shared/index';
import type { Board } from '@shared/index';
import { socketService } from '../services/socket';

interface GameStore {
  // Board reference (set externally)
  board: Board | null;
  setBoard: (board: Board) => void;

  // Game state (synced from server)
  gameId: string | null;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  revealRounds: number[];
  winner: 'mr-x' | 'detectives' | null;

  // WebSocket connection
  initializeWebSocket: () => void;
  cleanupWebSocket: () => void;

  // State updates from server
  updateGameState: (state: ClientGameState) => void;
  resetGame: () => void;

  // Player actions (via WebSocket)
  makeMove: (destinationId: number, transport: TransportType) => Promise<boolean>;

  // Getters
  getCurrentPlayer: () => Player | null;
  getValidMoves: () => Array<{ stationId: number; transports: TransportType[] }>;
  isMrXRevealed: () => boolean;
}

/**
 * Zustand store for Scotland Yard game state (WebSocket-enabled)
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  board: null,
  gameId: null,
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  revealRounds: [...MR_X_REVEAL_ROUNDS],
  winner: null,

  setBoard: (board: Board) => set({ board }),

  /**
   * Initialize WebSocket event listeners
   */
  initializeWebSocket: () => {
    console.log('🔧 initializeWebSocket called, checking socket connection...');

    // Ensure socket is connected
    if (!socketService.isConnected()) {
      console.log('🔌 Socket not connected, connecting now...');
      socketService.connect();
    }

    // Wait for socket to be ready before registering listeners
    const setupListeners = () => {
      console.log('🎧 Setting up game event listeners...');

      // Listen for game state updates from server
      socketService.onGameState((state: ClientGameState) => {
        console.log('📡 Received game state update:', state);
        get().updateGameState(state);
      });

      // Listen for move notifications
      socketService.onMoveMade((move) => {
        console.log('🎯 Move made:', move);
      });

      // Listen for game end
      socketService.onGameEnded((result) => {
        console.log('🏁 Game ended:', result);
        set({ phase: 'finished', winner: result.winner });
      });

      // Listen for game errors
      socketService.onGameError((error) => {
        console.error('❌ Game error:', error);
      });

      console.log('✅ WebSocket event listeners initialized');
    };

    if (socketService.isConnected()) {
      console.log('✅ Socket already connected, setting up listeners immediately');
      setupListeners();
    } else {
      console.log('⏳ Waiting for socket to connect before setting up listeners...');
      // Wait a bit for connection to establish, then setup listeners
      setTimeout(setupListeners, 100);
    }
  },

  /**
   * Cleanup WebSocket event listeners
   */
  cleanupWebSocket: () => {
    socketService.offGameEvents();
    console.log('🧹 WebSocket event listeners cleaned up');
  },

  /**
   * Update game state from server
   */
  updateGameState: (state: ClientGameState) => {
    console.log('🔄 updateGameState called with:', state);
    console.log('🔄 Setting phase to:', state.phase);
    set({
      gameId: state.gameId,
      phase: state.phase,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      round: state.round,
      revealRounds: state.revealRounds,
      winner: state.winner,
    });
    console.log('✅ Game state updated');
  },

  /**
   * Reset game to initial state
   */
  resetGame: () => {
    set({
      gameId: null,
      phase: 'setup',
      players: [],
      currentPlayerIndex: 0,
      round: 1,
      revealRounds: [...MR_X_REVEAL_ROUNDS],
      winner: null,
    });
  },

  /**
   * Make a move (via WebSocket to server)
   */
  makeMove: async (destinationId: number, transport: TransportType): Promise<boolean> => {
    const state = get();
    const { phase, players, currentPlayerIndex } = state;

    if (phase !== 'playing') {
      console.error('Game is not in playing phase');
      return false;
    }

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) {
      console.error('No current player');
      return false;
    }

    // Make move via WebSocket
    const response = await socketService.makeMove(destinationId, transport);

    if (response.success) {
      console.log(`✅ Move successful: ${currentPlayer.name} -> station ${destinationId} via ${transport}`);
      // State will be updated via WebSocket event
      return true;
    } else {
      console.error('❌ Move failed:', response.error);
      return false;
    }
  },

  /**
   * Get the current player
   */
  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex] || null;
  },

  /**
   * Get valid moves for current player
   */
  getValidMoves: () => {
    const { board, players, currentPlayerIndex } = get();
    if (!board) return [];

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return [];

    return getValidMovesForPlayer(board, currentPlayer, players);
  },

  /**
   * Check if Mr. X is revealed this round
   */
  isMrXRevealed: () => {
    const { round, revealRounds } = get();
    return revealRounds.includes(round);
  },
}));
