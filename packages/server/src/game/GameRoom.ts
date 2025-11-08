import { randomBytes } from 'crypto';
import { sql } from '../config/database.js';
import {
  Board,
  validateMove,
  hasValidMoves,
  isMrXCaptured,
  areAllDetectivesStuck,
  DEFAULT_DETECTIVE_TICKETS,
  DEFAULT_MR_X_TICKETS,
  MR_X_REVEAL_ROUNDS,
  MAX_ROUNDS,
  STARTING_POSITIONS,
} from '../../../shared/src/index.js';
import type {
  Player,
  GameState,
  GamePhase,
  TransportType,
  LobbyState,
  LobbyPlayer,
  ClientGameState,
} from '../../../shared/src/index.js';

/**
 * GameRoom manages a single game instance with Postgres persistence
 */
export class GameRoom {
  private gameId: string;
  private board: Board;

  constructor(gameId: string, board: Board) {
    this.gameId = gameId;
    this.board = board;
  }

  /**
   * Create a new game room
   */
  static async create(board: Board): Promise<GameRoom> {
    const gameId = generateGameId();
    const room = new GameRoom(gameId, board);

    // Create game record in database
    await sql`
      INSERT INTO games (id, phase, current_player_index, round)
      VALUES (${gameId}, 'waiting', 0, 1)
    `;

    console.log(`🎮 Created game room: ${gameId}`);
    return room;
  }

  /**
   * Load existing game room from database
   */
  static async load(gameId: string, board: Board): Promise<GameRoom | null> {
    const result = await sql`
      SELECT * FROM games WHERE id = ${gameId}
    `;

    if (result.length === 0) {
      return null;
    }

    return new GameRoom(gameId, board);
  }

  /**
   * Add player to lobby
   */
  async addPlayer(playerId: string, playerName: string): Promise<boolean> {
    // Get current game
    const game = await sql`
      SELECT * FROM games WHERE id = ${this.gameId}
    `;

    if (game.length === 0 || game[0].phase !== 'waiting') {
      return false;
    }

    // Check if player already exists
    const existing = await sql`
      SELECT * FROM players WHERE id = ${playerId} AND game_id = ${this.gameId}
    `;

    if (existing.length > 0) {
      return true;
    }

    // Check if lobby is full
    const playerCount = await sql`
      SELECT COUNT(*) as count FROM players WHERE game_id = ${this.gameId}
    `;

    const count = Number(playerCount[0].count);

    if (count >= 6) {
      return false;
    }

    // Determine if this is the host (first player)
    const isHost = count === 0;

    // Add player (host is automatically ready)
    await sql`
      INSERT INTO players (id, game_id, name, position, is_host, is_ready, tickets, player_order)
      VALUES (
        ${playerId},
        ${this.gameId},
        ${playerName},
        0,
        ${isHost},
        ${isHost},
        '{}'::jsonb,
        ${count}
      )
    `;

    console.log(`👤 Player ${playerName} joined game ${this.gameId}`);
    return true;
  }

  /**
   * Remove player from lobby
   */
  async removePlayer(playerId: string): Promise<void> {
    const player = await sql`
      SELECT * FROM players WHERE id = ${playerId} AND game_id = ${this.gameId}
    `;

    if (player.length === 0) return;

    // Delete player
    await sql`
      DELETE FROM players WHERE id = ${playerId}
    `;

    // Check if any players remain
    const remainingPlayers = await sql`
      SELECT * FROM players WHERE game_id = ${this.gameId}
      ORDER BY player_order
    `;

    if (remainingPlayers.length === 0) {
      // Delete game if no players left
      await this.destroy();
    } else if (player[0].is_host) {
      // Assign new host if host left (and set them as ready)
      await sql`
        UPDATE players
        SET is_host = true, is_ready = true
        WHERE game_id = ${this.gameId} AND player_order = (
          SELECT MIN(player_order) FROM players WHERE game_id = ${this.gameId}
        )
      `;
    }

    console.log(`👤 Player ${playerId} left game ${this.gameId}`);
  }

  /**
   * Set player ready status
   */
  async setPlayerReady(playerId: string, isReady: boolean): Promise<boolean> {
    const result = await sql`
      UPDATE players
      SET is_ready = ${isReady}
      WHERE id = ${playerId} AND game_id = ${this.gameId}
      RETURNING *
    `;

    return result.length > 0;
  }

  /**
   * Start the game (host only)
   */
  async startGame(hostId: string): Promise<boolean> {
    // Verify host
    const host = await sql`
      SELECT * FROM players
      WHERE id = ${hostId} AND game_id = ${this.gameId} AND is_host = true
    `;

    if (host.length === 0) {
      return false;
    }

    // Check all players are ready
    const players = await sql`
      SELECT * FROM players
      WHERE game_id = ${this.gameId}
      ORDER BY player_order
    `;

    if (players.length < 2) {
      return false;
    }

    const allReady = players.every((p: any) => p.is_ready || p.is_host);
    if (!allReady) {
      return false;
    }

    // Assign roles randomly
    const mrXIndex = Math.floor(Math.random() * players.length);
    const allPositions = [...STARTING_POSITIONS.mrX, ...STARTING_POSITIONS.detectives];
    const shuffledPositions = allPositions.sort(() => Math.random() - 0.5);

    // Update players with roles and starting positions
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const isMrX = i === mrXIndex;
      const tickets = isMrX ? DEFAULT_MR_X_TICKETS : DEFAULT_DETECTIVE_TICKETS;

      await sql`
        UPDATE players
        SET
          role = ${isMrX ? 'mr-x' : 'detective'},
          position = ${shuffledPositions[i]},
          tickets = ${JSON.stringify(tickets)}::jsonb,
          is_ready = false
        WHERE id = ${player.id}
      `;
    }

    // Update game to playing phase and reset reveal tracking
    await sql`
      UPDATE games
      SET phase = 'playing', current_player_index = 0, mr_x_last_revealed_position = NULL
      WHERE id = ${this.gameId}
    `;

    console.log(`🎮 Game ${this.gameId} started with ${players.length} players`);
    return true;
  }

  /**
   * Make a move (server-authoritative validation)
   */
  async makeMove(
    playerId: string,
    stationId: number,
    transport: TransportType
  ): Promise<{ success: boolean; error?: string }> {
    // Get game state
    const gameState = await this.getGameState();
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    // Verify it's player's turn
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate move
    const validation = validateMove(
      this.board,
      currentPlayer,
      stationId,
      transport,
      gameState.players
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Apply move to database
    const oldPosition = currentPlayer.position;
    const newTickets = { ...currentPlayer.tickets };
    newTickets[transport]--;

    await sql`
      UPDATE players
      SET
        position = ${stationId},
        tickets = ${JSON.stringify(newTickets)}::jsonb
      WHERE id = ${currentPlayer.id}
    `;

    // Record move in history
    await sql`
      INSERT INTO moves (
        game_id, player_id, player_name, role,
        from_station, to_station, transport, round, timestamp
      )
      VALUES (
        ${this.gameId},
        ${currentPlayer.id},
        ${currentPlayer.name},
        ${currentPlayer.role},
        ${oldPosition},
        ${stationId},
        ${transport},
        ${gameState.round},
        ${Date.now()}
      )
    `;

    // Refresh game state after move
    const updatedGameState = await this.getGameState();
    if (!updatedGameState) {
      return { success: false, error: 'Failed to update game state' };
    }

    const mrX = updatedGameState.players.find(p => p.role === 'mr-x')!;

    // Check win conditions
    let winner: 'mr-x' | 'detectives' | null = null;
    if (isMrXCaptured(updatedGameState.players)) {
      winner = 'detectives';
    } else if (areAllDetectivesStuck(this.board, updatedGameState.players)) {
      winner = 'mr-x';
    } else if (!hasValidMoves(this.board, mrX, updatedGameState.players)) {
      winner = 'detectives';
    } else if (updatedGameState.round >= MAX_ROUNDS) {
      winner = 'mr-x';
    }

    // Update game phase if ended
    if (winner) {
      await sql`
        UPDATE games
        SET phase = 'finished', winner = ${winner}
        WHERE id = ${this.gameId}
      `;
    }

    // Advance to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % updatedGameState.players.length;
    const nextRound = nextPlayerIndex === 0 ? gameState.round + 1 : gameState.round;

    // If we're advancing to a reveal round, store Mr. X's current position
    let mrXLastRevealedPosition = null;
    if (nextPlayerIndex === 0 && MR_X_REVEAL_ROUNDS.includes(nextRound)) {
      mrXLastRevealedPosition = mrX.position;
    }

    if (mrXLastRevealedPosition !== null) {
      await sql`
        UPDATE games
        SET
          current_player_index = ${nextPlayerIndex},
          round = ${nextRound},
          mr_x_last_revealed_position = ${mrXLastRevealedPosition}
        WHERE id = ${this.gameId}
      `;
    } else {
      await sql`
        UPDATE games
        SET
          current_player_index = ${nextPlayerIndex},
          round = ${nextRound}
        WHERE id = ${this.gameId}
      `;
    }

    console.log(
      `🎯 Player ${currentPlayer.name} moved from ${oldPosition} to ${stationId} via ${transport}`
    );

    return { success: true };
  }

  /**
   * Get lobby state
   */
  async getLobby(): Promise<LobbyState | null> {
    const game = await sql`
      SELECT * FROM games WHERE id = ${this.gameId}
    `;

    if (game.length === 0 || game[0].phase !== 'waiting') {
      return null;
    }

    const players = await sql`
      SELECT id, name, is_ready, is_host
      FROM players
      WHERE game_id = ${this.gameId}
      ORDER BY player_order
    `;

    const host = players.find((p: any) => p.is_host);

    const lobbyPlayers: LobbyPlayer[] = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      isReady: !!p.is_ready,  // Coerce to boolean
      isHost: !!p.is_host,    // Coerce to boolean
    }));

    return {
      gameId: this.gameId,
      players: lobbyPlayers,
      hostId: host?.id || '',
      phase: 'waiting' as const,
      maxPlayers: 6,
    };
  }

  /**
   * Get game state (full server-side state)
   */
  async getGameState(): Promise<GameState | null> {
    const game = await sql`
      SELECT * FROM games WHERE id = ${this.gameId}
    `;

    if (game.length === 0) {
      return null;
    }

    const players = await sql`
      SELECT * FROM players
      WHERE game_id = ${this.gameId}
      ORDER BY player_order
    `;

    const moves = await sql`
      SELECT * FROM moves
      WHERE game_id = ${this.gameId}
      ORDER BY created_at
    `;

    const gamePlayers: Player[] = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      position: p.position,
      tickets: p.tickets,
      isStuck: p.is_stuck,
    }));

    const moveHistory = moves.map((m: any) => ({
      playerId: m.player_id,
      playerName: m.player_name,
      role: m.role,
      from: m.from_station,
      to: m.to_station,
      transport: m.transport,
      round: m.round,
      timestamp: Number(m.timestamp),
    }));

    return {
      phase: game[0].phase as GamePhase,
      round: game[0].round,
      currentPlayerIndex: game[0].current_player_index,
      players: gamePlayers,
      moveHistory,
      revealRounds: [...MR_X_REVEAL_ROUNDS],
      winner: game[0].winner,
    };
  }

  /**
   * Get client-safe game state (Mr. X position filtered for detectives)
   */
  async getClientGameState(playerId: string): Promise<ClientGameState | null> {
    const gameState = await this.getGameState();
    if (!gameState) return null;

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return null;

    // Get the game record to check for last revealed position
    const game = await sql`
      SELECT mr_x_last_revealed_position FROM games WHERE id = ${this.gameId}
    `;
    const mrXLastRevealedPosition = game[0]?.mr_x_last_revealed_position;

    const isMrXRevealed = gameState.revealRounds.includes(gameState.round);
    const mrXPlayer = gameState.players.find(p => p.role === 'mr-x');

    // Clone players and filter Mr. X position
    const players: Player[] = gameState.players.map(p => {
      if (p.role === 'mr-x' && player.role !== 'mr-x') {
        if (isMrXRevealed) {
          // During reveal rounds, show Mr. X's position
          // Use the stored position if available, otherwise use actual position
          const revealedPosition = mrXLastRevealedPosition !== null && mrXLastRevealedPosition !== undefined
            ? mrXLastRevealedPosition
            : p.position;

          return {
            ...p,
            position: revealedPosition,
          };
        } else {
          // Hide Mr. X position from detectives when not revealed
          return {
            ...p,
            position: -1, // -1 indicates hidden position
          };
        }
      }
      return { ...p };
    });

    return {
      gameId: this.gameId,
      phase: gameState.phase,
      round: gameState.round,
      currentPlayerIndex: gameState.currentPlayerIndex,
      players,
      revealRounds: gameState.revealRounds,
      isMrXRevealed,
      winner: gameState.winner,
    };
  }

  /**
   * Reset game for rematch (keep players, reset game state)
   */
  async resetForRematch(): Promise<void> {
    // Get existing players
    const players = await sql`
      SELECT * FROM players WHERE game_id = ${this.gameId} ORDER BY player_order
    `;

    if (players.length < 2) {
      throw new Error('Not enough players for rematch');
    }

    // Delete old moves
    await sql`
      DELETE FROM moves WHERE game_id = ${this.gameId}
    `;

    // Randomly assign new roles
    const mrXIndex = Math.floor(Math.random() * players.length);
    const allPositions = [...STARTING_POSITIONS.mrX, ...STARTING_POSITIONS.detectives];
    const shuffledPositions = allPositions.sort(() => Math.random() - 0.5);

    // Update players with new roles, positions, and tickets
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const isMrX = i === mrXIndex;
      const tickets = isMrX ? DEFAULT_MR_X_TICKETS : DEFAULT_DETECTIVE_TICKETS;

      await sql`
        UPDATE players
        SET
          role = ${isMrX ? 'mr-x' : 'detective'},
          position = ${shuffledPositions[i]},
          tickets = ${JSON.stringify(tickets)}::jsonb,
          is_ready = false
        WHERE id = ${player.id}
      `;
    }

    // Reset game state
    await sql`
      UPDATE games
      SET
        phase = 'playing',
        current_player_index = 0,
        round = 1,
        mr_x_last_revealed_position = NULL,
        winner = NULL
      WHERE id = ${this.gameId}
    `;

    console.log(`🔄 Game ${this.gameId} reset for rematch with ${players.length} players`);
  }

  /**
   * Destroy game room and clean up database data
   */
  async destroy(): Promise<void> {
    await sql`
      DELETE FROM games WHERE id = ${this.gameId}
    `;

    console.log(`🗑️  Destroyed game room: ${this.gameId}`);
  }

  /**
   * Get game ID
   */
  getGameId(): string {
    return this.gameId;
  }
}

/**
 * Generate a random 6-character game ID
 */
function generateGameId(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}
