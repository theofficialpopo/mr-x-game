import { sql } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { MR_X_REVEAL_ROUNDS } from '../../../shared/src/index.js';
import type { TransportType, Player } from '../../../shared/src/index.js';

/**
 * GameStateManager handles database state updates
 * Separated from GameRoom to isolate persistence logic
 */
export class GameStateManager {
  private gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  /**
   * Apply a move to the database
   */
  async applyMove(
    player: Player,
    toStationId: number,
    transport: TransportType,
    round: number
  ): Promise<void> {
    const oldPosition = player.position;
    const newTickets = { ...player.tickets };
    newTickets[transport]--;

    // Update player position and tickets
    await sql`
      UPDATE players
      SET
        position = ${toStationId},
        tickets = ${JSON.stringify(newTickets)}::jsonb
      WHERE id = ${player.id}
    `;

    // Record move in history
    await sql`
      INSERT INTO moves (
        game_id, player_id, player_name, role,
        from_station, to_station, transport, round, timestamp
      )
      VALUES (
        ${this.gameId},
        ${player.id},
        ${player.name},
        ${player.role},
        ${oldPosition},
        ${toStationId},
        ${transport},
        ${round},
        ${Date.now()}
      )
    `;

    logger.info(`🎯 Player ${player.name} moved from ${oldPosition} to ${toStationId} via ${transport}`);
  }

  /**
   * Advance to the next player's turn
   */
  async advanceTurn(
    currentPlayerIndex: number,
    totalPlayers: number,
    currentRound: number,
    mrXPosition: number
  ): Promise<void> {
    const nextPlayerIndex = (currentPlayerIndex + 1) % totalPlayers;
    const nextRound = nextPlayerIndex === 0 ? currentRound + 1 : currentRound;

    // Check if we're advancing to a reveal round
    let mrXLastRevealedPosition = null;
    if (nextPlayerIndex === 0 && MR_X_REVEAL_ROUNDS.includes(nextRound)) {
      mrXLastRevealedPosition = mrXPosition;
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
  }

  /**
   * Mark the game as finished with a winner
   */
  async setWinner(winner: 'mr-x' | 'detectives'): Promise<void> {
    await sql`
      UPDATE games
      SET phase = 'finished', winner = ${winner}
      WHERE id = ${this.gameId}
    `;

    logger.info(`🏆 Game ${this.gameId} ended - Winner: ${winner}`);
  }

  /**
   * Update game to playing phase
   */
  async setPlayingPhase(): Promise<void> {
    await sql`
      UPDATE games
      SET phase = 'playing', current_player_index = 0, mr_x_last_revealed_position = NULL
      WHERE id = ${this.gameId}
    `;
  }
}
