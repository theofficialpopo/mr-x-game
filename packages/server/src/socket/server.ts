import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { GameRoom } from '../game/GameRoom.js';
import { Board, parseBoardData } from '../../../shared/src/index.js';
import { sql } from '../config/database.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  CreateGameResponse,
  JoinGameResponse,
  MoveResponse,
  MoveNotification,
} from '../../../shared/src/index.js';

/**
 * In-memory store for active game rooms
 * Note: Game state itself is stored in Redis, this just tracks room instances
 */
const gameRooms = new Map<string, GameRoom>();

/**
 * Board instance (loaded once on server start)
 */
let boardInstance: Board | null = null;

/**
 * Initialize Socket.IO server
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  // In production, client is served from same server, so allow same origin
  // In development, allow localhost:3000
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? true // Allow same origin in production (client served from same server)
    : (process.env.CLIENT_URL || 'http://localhost:3000');

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Load board data
  loadBoard().then(board => {
    boardInstance = board;
    console.log('✅ Board data loaded for game server');
  }).catch(err => {
    console.error('❌ Failed to load board data:', err);
    process.exit(1);
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    /**
     * Create a new game room
     */
    socket.on('lobby:create', async (playerName, playerUUID, callback) => {
      try {
        if (!boardInstance) {
          callback({ success: false, error: 'Server not ready' });
          return;
        }

        const gameRoom = await GameRoom.create(boardInstance);
        const gameId = gameRoom.getGameId();

        // Store room instance
        gameRooms.set(gameId, gameRoom);

        // Add player to lobby
        const added = await gameRoom.addPlayer(socket.id, playerName, playerUUID);
        if (!added) {
          callback({ success: false, error: 'Failed to join game' });
          return;
        }

        // Join socket room
        await socket.join(gameId);

        // Send success response
        callback({
          success: true,
          gameId,
          playerId: socket.id,
        });

        // Broadcast lobby update
        const lobby = await gameRoom.getLobby();
        if (lobby) {
          io.to(gameId).emit('lobby:updated', lobby);
        }

        console.log(`🎮 Created game ${gameId} for ${playerName}`);
      } catch (error) {
        console.error('Error creating game:', error);
        callback({ success: false, error: 'Internal server error' });
      }
    });

    /**
     * Join an existing game room
     */
    socket.on('lobby:join', async (gameId, playerName, playerUUID, callback) => {
      try {
        console.log(`🎯 Join attempt: ${playerName} (${socket.id}) -> game ${gameId}, UUID: ${playerUUID || 'none'}`);

        if (!boardInstance) {
          console.log('❌ Server not ready');
          callback({ success: false, error: 'Server not ready' });
          return;
        }

        // Get or load game room
        let gameRoom = gameRooms.get(gameId);
        if (!gameRoom) {
          console.log(`🔍 Loading game ${gameId} from database...`);
          const loadedRoom = await GameRoom.load(gameId, boardInstance);
          if (!loadedRoom) {
            console.log(`❌ Game ${gameId} not found`);
            callback({ success: false, error: 'Game not found' });
            return;
          }
          gameRoom = loadedRoom;
          gameRooms.set(gameId, gameRoom);
        }

        // Add player to lobby
        console.log(`➕ Adding player ${playerName} to game ${gameId}...`);
        const added = await gameRoom.addPlayer(socket.id, playerName, playerUUID);
        if (!added) {
          console.log(`❌ Failed to add player ${playerName} to game ${gameId}`);
          callback({ success: false, error: 'Game is full' });
          return;
        }
        console.log(`✅ Player ${playerName} added to game ${gameId}`);

        // Join socket room
        await socket.join(gameId);

        // Check if game is in lobby or already started
        const lobby = await gameRoom.getLobby();

        if (lobby) {
          // Game is in lobby phase
          callback({
            success: true,
            playerId: socket.id,
            lobby,
          });

          // Broadcast lobby update to all players
          io.to(gameId).emit('lobby:updated', lobby);
        } else {
          // Game has already started - send game state instead
          callback({
            success: true,
            playerId: socket.id,
          });

          // Send current game state to the reconnecting player
          const clientState = await gameRoom.getClientGameState(socket.id);
          if (clientState) {
            socket.emit('game:state', clientState);
            console.log(`📤 Sent game state to reconnecting player ${playerName}`);
          }
        }

        console.log(`👤 ${playerName} joined game ${gameId}`);
      } catch (error) {
        console.error(`❌ Error joining game ${gameId}:`, error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        callback({ success: false, error: 'Internal server error' });
      }
    });

    /**
     * Leave game room
     */
    socket.on('lobby:leave', async (callback) => {
      try {
        const gameId = await getPlayerGameId(socket.id);

        if (!gameId) {
          callback();
          return;
        }

        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) {
          callback();
          return;
        }

        const gameDestroyed = await gameRoom.removePlayer(socket.id);
        await socket.leave(gameId);

        if (gameDestroyed) {
          // Game was destroyed - remove from memory
          gameRooms.delete(gameId);
        } else {
          // Game still has players - broadcast lobby update if in lobby phase
          const lobby = await gameRoom.getLobby();
          if (lobby) {
            io.to(gameId).emit('lobby:updated', lobby);
          }
        }

        callback();
      } catch (error) {
        console.error('Error leaving game:', error);
        callback();
      }
    });

    /**
     * Set player ready status
     */
    socket.on('lobby:ready', async (isReady) => {
      try {
        const gameId = await getPlayerGameId(socket.id);
        if (!gameId) return;

        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) return;

        await gameRoom.setPlayerReady(socket.id, isReady);

        // Broadcast lobby update
        const lobby = await gameRoom.getLobby();
        if (lobby) {
          io.to(gameId).emit('lobby:updated', lobby);
        }
      } catch (error) {
        console.error('Error setting ready status:', error);
      }
    });

    /**
     * Start the game
     */
    socket.on('lobby:start', async () => {
      try {
        const gameId = await getPlayerGameId(socket.id);
        if (!gameId) {
          socket.emit('lobby:error', 'Not in a game');
          return;
        }

        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) {
          socket.emit('lobby:error', 'Game not found');
          return;
        }

        const started = await gameRoom.startGame(socket.id);
        if (!started) {
          socket.emit('lobby:error', 'Cannot start game');
          return;
        }

        // Send game state to all players
        const sockets = await io.in(gameId).fetchSockets();
        console.log(`📤 Emitting game:state to ${sockets.length} sockets in room ${gameId}`);
        for (const s of sockets) {
          const clientState = await gameRoom.getClientGameState(s.id);
          if (clientState) {
            console.log(`📤 Emitting game:state to socket ${s.id}:`, { phase: clientState.phase, gameId: clientState.gameId });
            s.emit('game:state', clientState);
          } else {
            console.log(`⚠️ No client state for socket ${s.id}`);
          }
        }

        console.log(`🚀 Game ${gameId} started!`);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('lobby:error', 'Failed to start game');
      }
    });

    /**
     * Make a move
     */
    socket.on('game:move', async (stationId, transport, callback) => {
      try {
        const gameId = await getPlayerGameId(socket.id);
        if (!gameId) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) {
          callback({ success: false, error: 'Game not found' });
          return;
        }

        // Validate and apply move
        const result = await gameRoom.makeMove(socket.id, stationId, transport);
        callback(result);

        if (!result.success) return;

        // Get updated game state
        const gameState = await gameRoom.getGameState();
        if (!gameState) return;

        // Create move notification
        const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
        const isMrXRevealed = gameState.revealRounds.includes(gameState.round - 1); // Previous round

        const moveNotification: MoveNotification = {
          playerId: lastMove.playerId,
          playerName: lastMove.playerName,
          role: lastMove.role,
          stationId: lastMove.role === 'mr-x' && !isMrXRevealed ? null : lastMove.to,
          transport: lastMove.transport,
          round: lastMove.round,
          timestamp: lastMove.timestamp,
        };

        // Broadcast move to all players
        io.to(gameId).emit('game:move:made', moveNotification);

        // Send updated game state to each player (with Mr. X filtering)
        const sockets = await io.in(gameId).fetchSockets();
        for (const s of sockets) {
          const clientState = await gameRoom.getClientGameState(s.id);
          if (clientState) {
            s.emit('game:state', clientState);
          }
        }

        // Check if game ended
        if (gameState.phase === 'finished' && gameState.winner) {
          io.to(gameId).emit('game:ended', {
            winner: gameState.winner,
            reason: gameState.winner === 'mr-x' ? 'mr-x-escaped' : 'mr-x-caught',
            finalPositions: new Map(gameState.players.map(p => [p.id, p.position])),
          });

          // Clean up game room after delay
          setTimeout(() => {
            gameRoom.destroy();
            gameRooms.delete(gameId);
          }, 60000); // 1 minute
        }
      } catch (error) {
        console.error('Error making move:', error);
        callback({ success: false, error: 'Failed to make move' });
      }
    });

    /**
     * Rematch ready handler
     */
    socket.on('rematch:ready', async (isReady: boolean) => {
      try {
        const gameId = await getPlayerGameId(socket.id);
        if (!gameId) return;

        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) return;

        // Update player ready status in database
        await gameRoom.setPlayerReady(socket.id, isReady);

        // Get all players and their ready status
        const gameState = await gameRoom.getGameState();
        if (!gameState || gameState.phase !== 'finished') return;

        const players = await sql`
          SELECT id, is_ready FROM players WHERE game_id = ${gameId}
        `;

        const readyPlayers = players.filter((p: any) => p.is_ready).map((p: any) => p.id);

        // Broadcast ready status to all players in game
        io.to(gameId).emit('rematch:ready:updated', readyPlayers);

        // If all players are ready, start a new game
        const allReady = players.every((p: any) => p.is_ready);
        if (allReady && players.length >= 2) {
          console.log(`🔄 All players ready for rematch in game ${gameId}`);

          // Reset game state while keeping players
          await gameRoom.resetForRematch();

          // Send updated game state to all players
          const sockets = await io.in(gameId).fetchSockets();
          for (const s of sockets) {
            const clientState = await gameRoom.getClientGameState(s.id);
            if (clientState) {
              console.log(`📤 Emitting game:state to socket ${s.id}:`, {
                phase: clientState.phase,
                gameId: clientState.gameId,
              });
              s.emit('game:state', clientState);
            }
          }

          console.log(`🚀 Rematch started for game ${gameId}!`);
        }
      } catch (error) {
        console.error('Error handling rematch ready:', error);
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', async () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);

      // Don't remove players on disconnect - allow reconnection
      // Players are only removed when they explicitly leave via 'lobby:leave'
      console.log(`💾 Keeping player data for reconnection`);
    });
  });

  return io;
}

/**
 * Get game ID for a player (helper function)
 */
async function getPlayerGameId(playerId: string): Promise<string | null> {
  const { sql } = await import('../config/database.js');
  const result = await sql`
    SELECT game_id FROM players WHERE id = ${playerId} LIMIT 1
  `;
  return result.length > 0 ? result[0].game_id : null;
}

/**
 * Load board data from text files
 */
async function loadBoard(): Promise<Board> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Load from client's public data folder
  const dataDir = path.join(__dirname, '../../../client/public/data');
  const stationsPath = path.join(dataDir, 'stations.txt');
  const connectionsPath = path.join(dataDir, 'connections.txt');

  const [stationsText, connectionsText] = await Promise.all([
    fs.readFile(stationsPath, 'utf-8'),
    fs.readFile(connectionsPath, 'utf-8')
  ]);

  // Parse the board data
  const boardData = parseBoardData(stationsText, connectionsText);

  // Create and initialize board
  const board = new Board();
  board.initialize(boardData.stations, boardData.connections);

  return board;
}
