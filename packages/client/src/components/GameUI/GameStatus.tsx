import { useGameStore } from '../../store/gameStore';
import type { Player } from '@shared/types/game';
import { MR_X_REVEAL_ROUNDS } from '@shared/index';

const TRANSPORT_COLORS = {
  taxi: '#FFD700',
  bus: '#32CD32',
  underground: '#FF1493',
  water: '#00CED1',
};

const TRANSPORT_ICONS = {
  taxi: '🚕',
  bus: '🚌',
  underground: '🚇',
  water: '⛴️',
};

export function GameStatus() {
  const { players, currentPlayerIndex, round, phase, result, moveHistory, isMrXRevealed } =
    useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const mrX = players.find((p) => p.role === 'mr-x');
  const isRevealed = isMrXRevealed();

  if (phase === 'setup') {
    return null;
  }

  const nextRevealRound = MR_X_REVEAL_ROUNDS.find((r) => r > round);

  return (
    <div className="absolute top-4 left-4 right-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex gap-4">
        {/* Main Status Panel */}
        <div className="flex-1 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Current Player */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  currentPlayer?.role === 'mr-x' ? 'bg-pink-500' : 'bg-cyan-500'
                }`}
              />
              <div>
                <div className="text-xs text-gray-400">Current Turn</div>
                <div className="font-bold text-white flex items-center gap-2">
                  {currentPlayer?.name}
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      currentPlayer?.role === 'mr-x'
                        ? 'bg-pink-500 bg-opacity-20 text-pink-400'
                        : 'bg-cyan-500 bg-opacity-20 text-cyan-400'
                    }`}
                  >
                    {currentPlayer?.role === 'mr-x' ? 'Mr. X' : 'Detective'}
                  </span>
                </div>
              </div>
            </div>

            {/* Round Counter */}
            <div className="text-center">
              <div className="text-xs text-gray-400">Round</div>
              <div className="font-bold text-2xl text-white">
                {round}
                <span className="text-gray-500 text-base">/ 24</span>
              </div>
              {nextRevealRound && (
                <div className="text-xs text-pink-400">
                  Next reveal: {nextRevealRound}
                </div>
              )}
            </div>

            {/* Mr. X Status */}
            {mrX && (
              <div className="text-center">
                <div className="text-xs text-gray-400">Mr. X Status</div>
                <div
                  className={`font-bold ${
                    isRevealed ? 'text-pink-400' : 'text-gray-500'
                  }`}
                >
                  {isRevealed ? '👁️ Revealed' : '❓ Hidden'}
                </div>
                {mrX.position && isRevealed && (
                  <div className="text-xs text-gray-400">Station {mrX.position}</div>
                )}
              </div>
            )}
          </div>

          {/* Game Result */}
          {phase === 'finished' && result && (
            <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg text-center">
              <div className="font-bold text-white text-lg">
                {result.winner === 'mr-x' ? '👤 Mr. X Wins!' : '🔍 Detectives Win!'}
              </div>
              <div className="text-sm text-white opacity-90">
                {result.condition === 'mr-x-captured' && 'Mr. X was captured!'}
                {result.condition === 'detectives-stuck' && 'All detectives are stuck!'}
                {result.condition === 'mr-x-survived' && 'Mr. X survived 24 rounds!'}
              </div>
            </div>
          )}
        </div>

        {/* Players Tickets Panel */}
        <div className="w-80 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <h3 className="font-bold text-white mb-3">Player Tickets</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.map((player, index) => (
              <PlayerTicketDisplay
                key={player.id}
                player={player}
                isCurrentPlayer={index === currentPlayerIndex}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Move History (collapsible) */}
      {moveHistory.length > 0 && (
        <div className="mt-4 max-w-7xl mx-auto">
          <details className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700 pointer-events-auto">
            <summary className="cursor-pointer p-3 font-semibold text-white hover:bg-gray-800 hover:bg-opacity-50 rounded-lg">
              Move History ({moveHistory.length} moves)
            </summary>
            <div className="p-3 max-h-48 overflow-y-auto space-y-1">
              {moveHistory.slice().reverse().map((move, index) => (
                <div key={index} className="text-sm flex items-center gap-2 text-gray-300">
                  <span className="text-gray-500">
                    R{move.round}:
                  </span>
                  <span className={move.playerRole === 'mr-x' ? 'text-pink-400' : 'text-cyan-400'}>
                    {move.playerRole === 'mr-x' ? 'Mr. X' : 'Detective'}
                  </span>
                  <span>{TRANSPORT_ICONS[move.transport]}</span>
                  {move.isRevealed ? (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="text-white">Station {move.to}</span>
                    </>
                  ) : move.playerRole === 'detective' ? (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="text-white">Station {move.to}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">(hidden)</span>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function PlayerTicketDisplay({
  player,
  isCurrentPlayer,
}: {
  player: Player;
  isCurrentPlayer: boolean;
}) {
  return (
    <div
      className={`p-2 rounded-lg border ${
        isCurrentPlayer
          ? 'border-white bg-gray-800 bg-opacity-50'
          : 'border-gray-700 bg-gray-900 bg-opacity-30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-semibold text-sm ${
            player.role === 'mr-x' ? 'text-pink-400' : 'text-cyan-400'
          }`}
        >
          {player.name}
        </span>
        <span className="text-xs text-gray-500">#{player.position}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs">
        {(['taxi', 'bus', 'underground', 'water'] as const).map((transport) => (
          <div
            key={transport}
            className="flex flex-col items-center p-1 rounded"
            style={{
              backgroundColor: `${TRANSPORT_COLORS[transport]}20`,
            }}
          >
            <span>{TRANSPORT_ICONS[transport]}</span>
            <span className="font-bold text-white">
              {player.tickets[transport] > 99 ? '∞' : player.tickets[transport]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
