import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  LobbyState,
  ClientGameState,
  MoveNotification,
  GameEndResult,
  CreateGameResponse,
  JoinGameResponse,
  MoveResponse,
  TransportType,
} from '@shared';

/**
 * Socket.IO client for game communication
 */
class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  }

  /**
   * Connect to the server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('⚠️ Already connected to server');
      return;
    }

    console.log(`🔌 Connecting to server at ${this.serverUrl}...`);

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Disconnected from server');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // ============ Lobby Events ============

  /**
   * Create a new game
   */
  createGame(playerName: string): Promise<CreateGameResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('lobby:create', playerName, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Join an existing game
   */
  joinGame(gameId: string, playerName: string): Promise<JoinGameResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('lobby:join', gameId, playerName, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Leave the current game
   */
  leaveGame(): void {
    if (this.socket) {
      this.socket.emit('lobby:leave');
    }
  }

  /**
   * Set ready status
   */
  setReady(isReady: boolean): void {
    if (this.socket) {
      this.socket.emit('lobby:ready', isReady);
    }
  }

  /**
   * Start the game (host only)
   */
  startGame(): void {
    if (this.socket) {
      this.socket.emit('lobby:start');
    }
  }

  /**
   * Listen for lobby updates
   */
  onLobbyUpdated(callback: (lobby: LobbyState) => void): void {
    this.socket?.on('lobby:updated', callback);
  }

  /**
   * Listen for lobby errors
   */
  onLobbyError(callback: (error: string) => void): void {
    this.socket?.on('lobby:error', callback);
  }

  // ============ Game Events ============

  /**
   * Make a move
   */
  makeMove(stationId: number, transport: TransportType): Promise<MoveResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('game:move', stationId, transport, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Listen for game state updates
   */
  onGameState(callback: (state: ClientGameState) => void): void {
    console.log('🔧 Registering game:state listener');
    this.socket?.on('game:state', (state: ClientGameState) => {
      console.log('📨 Socket received game:state event:', state);
      callback(state);
    });
  }

  /**
   * Listen for move notifications
   */
  onMoveMade(callback: (move: MoveNotification) => void): void {
    this.socket?.on('game:move:made', callback);
  }

  /**
   * Listen for game end
   */
  onGameEnded(callback: (result: GameEndResult) => void): void {
    this.socket?.on('game:ended', callback);
  }

  /**
   * Listen for game errors
   */
  onGameError(callback: (error: string) => void): void {
    this.socket?.on('game:error', callback);
  }

  // ============ Rematch ============

  /**
   * Set rematch ready status
   */
  setRematchReady(isReady: boolean): void {
    console.log('Setting rematch ready:', isReady);
    this.socket?.emit('rematch:ready', isReady);
  }

  /**
   * Listen for rematch ready updates
   */
  onRematchReady(callback: (readyPlayers: string[]) => void): void {
    this.socket?.on('rematch:ready:updated', callback);
  }

  /**
   * Remove rematch event listeners
   */
  offRematchReady(): void {
    this.socket?.off('rematch:ready:updated');
  }

  // ============ Event Cleanup ============

  /**
   * Remove all lobby event listeners
   */
  offLobbyEvents(): void {
    this.socket?.off('lobby:updated');
    this.socket?.off('lobby:error');
  }

  /**
   * Remove all game event listeners
   */
  offGameEvents(): void {
    this.socket?.off('game:state');
    this.socket?.off('game:move:made');
    this.socket?.off('game:ended');
    this.socket?.off('game:error');
  }

  /**
   * Remove all event listeners
   */
  offAllEvents(): void {
    this.offLobbyEvents();
    this.offGameEvents();
  }
}

// Export singleton instance
export const socketService = new SocketService();
