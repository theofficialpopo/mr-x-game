import type { Board } from './Board';
import type { Player, TicketCounts } from '../types/game';
import type { TransportType } from '../types/board';

/**
 * Validation result with optional error message
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check if a player has enough tickets for a transport type
 */
export function hasTicket(tickets: TicketCounts, transport: TransportType): boolean {
  return tickets[transport] > 0;
}

/**
 * Check if a move is valid according to Scotland Yard rules
 */
export function validateMove(
  board: Board,
  player: Player,
  destinationId: number,
  transport: TransportType,
  allPlayers: Player[]
): ValidationResult {
  const fromId = player.position;

  // Special handling for black tickets (Mr. X only)
  if (transport === 'black') {
    // Only Mr. X can use black tickets
    if (player.role !== 'mr-x') {
      return {
        valid: false,
        error: 'Only Mr. X can use black tickets',
      };
    }

    // Check if player has black ticket
    if (!hasTicket(player.tickets, 'black')) {
      return {
        valid: false,
        error: 'Not enough black tickets',
      };
    }

    // Black ticket can use ANY available transport from current station
    // Check if there's ANY connection to the destination
    const allTransports: TransportType[] = ['taxi', 'bus', 'underground', 'water'];
    const hasConnection = allTransports.some(t =>
      board.getValidMoves(fromId, t).includes(destinationId)
    );

    if (!hasConnection) {
      return {
        valid: false,
        error: `No connection from station ${fromId} to ${destinationId}`,
      };
    }
  } else {
    // Regular transport validation
    // Check if player has required ticket
    if (!hasTicket(player.tickets, transport)) {
      return {
        valid: false,
        error: `Not enough ${transport} tickets`,
      };
    }

    // Check if connection exists with the specified transport type
    const validMoves = board.getValidMoves(fromId, transport);
    if (!validMoves.includes(destinationId)) {
      return {
        valid: false,
        error: `No ${transport} connection from station ${fromId} to ${destinationId}`,
      };
    }
  }

  // Check if destination station exists
  if (!board.hasStation(destinationId)) {
    return {
      valid: false,
      error: `Station ${destinationId} does not exist`,
    };
  }

  // Detectives cannot move to stations occupied by other detectives
  // (but CAN move to Mr. X's station to capture him!)
  if (player.role === 'detective') {
    const isOccupiedByDetective = allPlayers.some(
      (p) => p.id !== player.id && p.position === destinationId && p.role === 'detective'
    );
    if (isOccupiedByDetective) {
      return {
        valid: false,
        error: `Station ${destinationId} is occupied by another detective`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get all valid moves for a player
 */
export function getValidMovesForPlayer(
  board: Board,
  player: Player,
  allPlayers: Player[]
): Array<{ stationId: number; transports: TransportType[] }> {
  const fromId = player.position;
  const validMovesMap = new Map<number, TransportType[]>();

  // Get available transport types based on tickets
  const availableTransports: TransportType[] = [];
  if (player.tickets.taxi > 0) availableTransports.push('taxi');
  if (player.tickets.bus > 0) availableTransports.push('bus');
  if (player.tickets.underground > 0) availableTransports.push('underground');
  if (player.tickets.water > 0) availableTransports.push('water');

  // For each available transport, get valid destinations
  for (const transport of availableTransports) {
    const destinations = board.getValidMoves(fromId, transport);

    for (const destId of destinations) {
      // For detectives, skip stations occupied by other detectives
      // (but allow moving to Mr. X's station to capture him!)
      if (player.role === 'detective') {
        const isOccupiedByDetective = allPlayers.some(
          (p) => p.id !== player.id && p.position === destId && p.role === 'detective'
        );
        if (isOccupiedByDetective) continue;
      }

      // For Mr. X, skip stations occupied by detectives
      if (player.role === 'mr-x') {
        const isOccupiedByDetective = allPlayers.some(
          (p) => p.position === destId && p.role === 'detective'
        );
        if (isOccupiedByDetective) continue;
      }

      // Add transport option to this destination
      if (!validMovesMap.has(destId)) {
        validMovesMap.set(destId, []);
      }
      validMovesMap.get(destId)!.push(transport);
    }
  }

  // Mr. X can also use black tickets for ANY available connection
  if (player.role === 'mr-x' && player.tickets.black > 0) {
    // Black ticket can use any transport type
    const allTransportTypes: TransportType[] = ['taxi', 'bus', 'underground', 'water'];

    for (const transport of allTransportTypes) {
      const destinations = board.getValidMoves(fromId, transport);

      for (const destId of destinations) {
        // Skip stations occupied by detectives
        const isOccupiedByDetective = allPlayers.some(
          (p) => p.position === destId && p.role === 'detective'
        );
        if (isOccupiedByDetective) continue;

        // Add black as an option to this destination
        if (!validMovesMap.has(destId)) {
          validMovesMap.set(destId, []);
        }
        // Only add black if not already in the list
        if (!validMovesMap.get(destId)!.includes('black')) {
          validMovesMap.get(destId)!.push('black');
        }
      }
    }
  }

  // Convert map to array
  return Array.from(validMovesMap.entries()).map(([stationId, transports]) => ({
    stationId,
    transports,
  }));
}

/**
 * Check if a player has any valid moves
 */
export function hasValidMoves(
  board: Board,
  player: Player,
  allPlayers: Player[]
): boolean {
  const validMoves = getValidMovesForPlayer(board, player, allPlayers);
  return validMoves.length > 0;
}

/**
 * Check if all detectives are stuck (no valid moves)
 */
export function areAllDetectivesStuck(
  board: Board,
  players: Player[]
): boolean {
  const detectives = players.filter((p) => p.role === 'detective');

  if (detectives.length === 0) {
    return false; // No detectives, can't be stuck
  }

  return detectives.every((detective) => !hasValidMoves(board, detective, players));
}

/**
 * Check if Mr. X is captured (on same station as any detective)
 */
export function isMrXCaptured(players: Player[]): boolean {
  const mrX = players.find((p) => p.role === 'mr-x');
  if (!mrX) return false;

  const detectives = players.filter((p) => p.role === 'detective');
  return detectives.some((detective) => detective.position === mrX.position);
}
