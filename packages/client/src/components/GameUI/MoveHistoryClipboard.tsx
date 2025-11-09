import { useGameStore } from '../../store/gameStore';
import { MR_X_REVEAL_ROUNDS, TRANSPORT_ICONS } from '@shared';
import type { Move } from '@shared/types/game';
import { socketService } from '../../services/socket';

export function MoveHistoryClipboard() {
  const currentRound = useGameStore((state) => state.round);
  const players = useGameStore((state) => state.players);
  const moveHistory = useGameStore((state) => state.moveHistory);

  const myPlayerId = socketService.getSocketId();
  const isMrX = players.find(p => p.id === myPlayerId)?.role === 'mr-x';

  // Get only Mr. X's moves
  const mrXMoves = moveHistory.filter((m: Move) => m.role === 'mr-x');

  // Create array of all 24 rounds
  const rounds = Array.from({ length: 24 }, (_, i) => i + 1);

  const getMoveForRound = (roundNum: number): Move | null => {
    return mrXMoves.find((m: Move) => m.round === roundNum) || null;
  };

  return (
    <div className="absolute top-20 right-4 w-64 z-20">
      {/* Clipboard */}
      <div className="bg-amber-50 rounded-lg shadow-2xl border-4 border-amber-900 relative">
        {/* Clipboard Clip */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gray-700 rounded-t-lg border-2 border-gray-800 shadow-lg"></div>

        {/* Header */}
        <div className="bg-amber-100 border-b-2 border-amber-900 p-3 rounded-t-md">
          <h3 className="text-center font-bold text-gray-900 text-sm">
            🕵️ Mr. X Travel Log
          </h3>
        </div>

        {/* Move History Grid */}
        <div className="p-3 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-6 gap-1">
            {rounds.map((roundNum) => {
              const isRevealRound = MR_X_REVEAL_ROUNDS.includes(roundNum);
              const isCurrent = roundNum === currentRound;
              const isPast = roundNum < currentRound;
              const move = getMoveForRound(roundNum);

              // Show transport if:
              // - You are Mr. X (see all your moves)
              // - It's a reveal round and the move has been made
              // - It's a past reveal round
              const shouldShowTransport = move && (isMrX || (isRevealRound && isPast));

              return (
                <div
                  key={roundNum}
                  className={`
                    relative aspect-square rounded border-2 flex flex-col items-center justify-center text-xs font-bold
                    ${isCurrent ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-110 z-10' : ''}
                    ${isRevealRound && !isCurrent ? 'border-pink-600 bg-pink-100' : ''}
                    ${!isRevealRound && !isCurrent ? 'border-gray-400 bg-white' : ''}
                    ${isPast && !shouldShowTransport ? 'bg-gray-100' : ''}
                  `}
                  title={isRevealRound ? 'Reveal Round' : `Round ${roundNum}`}
                >
                  {/* Round Number */}
                  <div className={`text-xs ${isCurrent ? 'text-cyan-700' : isRevealRound ? 'text-pink-700' : 'text-gray-600'}`}>
                    {roundNum}
                  </div>

                  {/* Transport Icon or Hidden Indicator */}
                  {move && (
                    <div className="text-lg">
                      {shouldShowTransport ? (
                        TRANSPORT_ICONS[move.transport]
                      ) : (
                        <span className="text-gray-400">❓</span>
                      )}
                    </div>
                  )}

                  {/* Reveal indicator */}
                  {isRevealRound && (
                    <div className="absolute -top-1 -right-1 text-xs">
                      👁️
                    </div>
                  )}

                  {/* Current round indicator */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-amber-100 border-t-2 border-amber-900 p-2 rounded-b-md text-xs">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-pink-600 bg-pink-100"></div>
              <span>Reveal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-cyan-500 bg-cyan-100"></div>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
