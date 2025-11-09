import { isMrXCaptured, areAllDetectivesStuck, hasValidMoves, MAX_ROUNDS } from '../../../shared/src/index.js';
import type { Board } from '../../../shared/src/index.js';
import type { Player } from '../../../shared/src/index.js';

/**
 * WinConditionChecker handles all win condition logic
 * Separated from GameRoom to follow Single Responsibility Principle
 */
export class WinConditionChecker {
  private board: Board;

  constructor(board: Board) {
    this.board = board;
  }

  /**
   * Check if the game has ended and determine the winner
   * @returns 'mr-x' | 'detectives' | null
   */
  checkWinner(players: Player[], currentRound: number): 'mr-x' | 'detectives' | null {
    const mrX = players.find(p => p.role === 'mr-x');
    if (!mrX) return null;

    // Detectives win if they catch Mr. X
    if (isMrXCaptured(players)) {
      return 'detectives';
    }

    // Mr. X wins if all detectives are stuck
    if (areAllDetectivesStuck(this.board, players)) {
      return 'mr-x';
    }

    // Detectives win if Mr. X has no valid moves
    if (!hasValidMoves(this.board, mrX, players)) {
      return 'detectives';
    }

    // Mr. X wins if max rounds reached
    if (currentRound >= MAX_ROUNDS) {
      return 'mr-x';
    }

    // Game continues
    return null;
  }
}
