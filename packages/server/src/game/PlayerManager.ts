import { sql } from '../config/database.js';

/**
 * PlayerManager handles all player-related operations for a game
 * Responsibilities: add, remove, reconnect, ready state
 */
export class PlayerManager {
  private gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  /**
   * Add a player to the game (or reconnect if they exist)
   */
  async addPlayer(playerId: string, playerName: string, playerUUID?: string): Promise<boolean> {
    // Get current game
    const game = await sql`
      SELECT * FROM games WHERE id = ${this.gameId}
    `;

    if (game.length === 0) {
      return false;
    }

    // Check if player is reconnecting (by UUID or by name for legacy support)
    let existingPlayer = null;

    // First try to find by UUID
    if (playerUUID) {
      const byUUID = await sql`
        SELECT * FROM players WHERE player_uuid = ${playerUUID} AND game_id = ${this.gameId}
      `;
      if (byUUID.length > 0) {
        existingPlayer = byUUID[0];
      }
    }

    // If not found by UUID, try by name (for backwards compatibility)
    if (!existingPlayer) {
      const byName = await sql`
        SELECT * FROM players WHERE name = ${playerName} AND game_id = ${this.gameId}
      `;
      if (byName.length > 0) {
        existingPlayer = byName[0];
      }
    }

    // If player exists, update their socket ID and UUID
    if (existingPlayer) {
      await sql`
        UPDATE players
        SET id = ${playerId}, player_uuid = ${playerUUID || null}
        WHERE name = ${playerName} AND game_id = ${this.gameId}
      `;
      console.log(`🔄 Player ${playerName} (UUID: ${playerUUID || 'legacy'}) reconnected to game ${this.gameId} (phase: ${game[0].phase})`);
      return true;
    }

    // Only allow new players during 'waiting' phase
    if (game[0].phase !== 'waiting') {
      return false;
    }

    // Check if game is full (max 6 players)
    const count = await this.getPlayerCount();
    if (count >= 6) {
      return false;
    }

    // Determine if this is the host (first player)
    const isHost = count === 0;

    // Add player (host is automatically ready)
    await sql`
      INSERT INTO players (id, player_uuid, game_id, name, position, is_host, is_ready, tickets, player_order)
      VALUES (
        ${playerId},
        ${playerUUID || null},
        ${this.gameId},
        ${playerName},
        0,
        ${isHost},
        ${isHost},
        '{}'::jsonb,
        ${count}
      )
    `;

    console.log(`👤 Player ${playerName} (UUID: ${playerUUID || 'none'}) joined game ${this.gameId}`);
    return true;
  }

  /**
   * Remove a player from the game
   * Returns true if game should be destroyed (no players left)
   */
  async removePlayer(playerId: string): Promise<boolean> {
    const player = await sql`
      SELECT * FROM players WHERE id = ${playerId} AND game_id = ${this.gameId}
    `;

    if (player.length === 0) {
      return false;
    }

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
      // No players left - signal game should be destroyed
      console.log(`👥 No players remain in game ${this.gameId} - signaling for destruction`);
      return true;
    }

    // If host left, assign new host
    if (player[0].is_host) {
      await sql`
        UPDATE players
        SET is_host = true, is_ready = true
        WHERE game_id = ${this.gameId} AND player_order = (
          SELECT MIN(player_order) FROM players WHERE game_id = ${this.gameId}
        )
      `;
    }

    return false; // Game still has players
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
   * Get all players for the game
   */
  async getAllPlayers() {
    return await sql`
      SELECT * FROM players
      WHERE game_id = ${this.gameId}
      ORDER BY player_order
    `;
  }

  /**
   * Get player count
   */
  async getPlayerCount(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM players WHERE game_id = ${this.gameId}
    `;
    return parseInt(result[0].count);
  }

  /**
   * Check if all players are ready
   */
  async areAllPlayersReady(): Promise<boolean> {
    const result = await sql`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE is_ready = true) as ready
      FROM players
      WHERE game_id = ${this.gameId}
    `;

    const { total, ready } = result[0];
    return parseInt(total) > 1 && parseInt(total) === parseInt(ready);
  }

  /**
   * Reset all players' ready status to false
   */
  async resetAllPlayersReady(): Promise<void> {
    await sql`
      UPDATE players
      SET is_ready = false
      WHERE game_id = ${this.gameId}
    `;
  }

  /**
   * Get host player ID
   */
  async getHostId(): Promise<string | null> {
    const result = await sql`
      SELECT id FROM players
      WHERE game_id = ${this.gameId} AND is_host = true
      LIMIT 1
    `;

    return result.length > 0 ? result[0].id : null;
  }
}
