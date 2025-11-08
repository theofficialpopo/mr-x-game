import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socket';
import { useState, useEffect } from 'react';

interface GameOverProps {
  onBackToLobby: () => void;
}

const ROLE_COLORS = {
  'mr-x': {
    primary: '#ec4899',
    secondary: '#f9a8d4',
    bg: 'bg-pink-500',
    text: 'text-pink-400',
    border: 'border-pink-500',
  },
  'detective': {
    primary: '#06b6d4',
    secondary: '#67e8f9',
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500',
  },
};

export function GameOver({ onBackToLobby }: GameOverProps) {
  const { winner, players } = useGameStore();
  const [playersReady, setPlayersReady] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  const myPlayerId = socketService.getSocketId();
  const myPlayer = players.find(p => p.id === myPlayerId);
  const didIWin = myPlayer && (
    (winner === 'mr-x' && myPlayer.role === 'mr-x') ||
    (winner === 'detectives' && myPlayer.role === 'detective')
  );

  useEffect(() => {
    // Listen for rematch ready updates
    socketService.onRematchReady((readyPlayers) => {
      setPlayersReady(new Set(readyPlayers));
    });

    return () => {
      socketService.offRematchReady();
    };
  }, []);

  const handleReady = () => {
    setIsReady(!isReady);
    socketService.setRematchReady(!isReady);
  };

  const allReady = players.length > 0 && players.every(p => playersReady.has(p.id));

  const winnerRole = winner === 'mr-x' ? 'mr-x' : 'detective';
  const colors = ROLE_COLORS[winnerRole];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4">
        <div
          className={`bg-black bg-opacity-80 backdrop-blur-md rounded-lg p-8 space-y-6 border-2 shadow-2xl ${colors.border}`}
          style={{
            boxShadow: `0 0 40px ${colors.primary}40`
          }}
        >

          {/* Winner Announcement */}
          <div className="text-center space-y-4">
            <h1
              className={`text-6xl font-bold ${didIWin ? 'text-green-400' : 'text-red-400'}`}
              style={{
                textShadow: didIWin
                  ? '0 0 20px rgba(34, 197, 94, 0.5)'
                  : '0 0 20px rgba(239, 68, 68, 0.5)'
              }}
            >
              {didIWin ? 'Victory!' : 'Defeat'}
            </h1>

            <div className="text-3xl font-semibold text-white">
              {winner === 'mr-x' ? (
                <>
                  <span className={colors.text}>Mr. X</span> has escaped!
                </>
              ) : (
                <>
                  <span className={colors.text}>Detectives</span> captured Mr. X!
                </>
              )}
            </div>

            <div className="text-gray-400 text-lg">
              {didIWin
                ? 'Congratulations! You won this round!'
                : 'Better luck next time!'}
            </div>
          </div>

          {/* Player List with Ready Status */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center uppercase tracking-wide">
              Players ({playersReady.size}/{players.length} ready for rematch)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => {
                const playerReady = playersReady.has(player.id);
                const playerWon = (
                  (winner === 'mr-x' && player.role === 'mr-x') ||
                  (winner === 'detectives' && player.role === 'detective')
                );
                const playerColors = ROLE_COLORS[player.role];

                return (
                  <div
                    key={player.id}
                    className={`bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-3 border transition-all ${
                      playerWon
                        ? 'border-green-500 shadow-lg'
                        : 'border-red-500/50'
                    }`}
                    style={{
                      boxShadow: playerWon
                        ? '0 0 15px rgba(34, 197, 94, 0.3)'
                        : '0 0 10px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Role Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0 ${playerColors.bg} bg-opacity-20 ${playerColors.border}`}
                      >
                        {player.role === 'mr-x' ? '❓' : '🔍'}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {player.name}
                        </p>
                        <p className={`text-xs ${playerColors.text}`}>
                          {player.role === 'mr-x' ? 'Mr. X' : 'Detective'}
                        </p>
                      </div>

                      {/* Ready Badge */}
                      {playerReady && (
                        <div className="px-2 py-1 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 text-xs rounded font-semibold flex-shrink-0">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReady}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                isReady
                  ? 'bg-green-500 bg-opacity-20 border-green-500 text-green-400 hover:bg-opacity-30'
                  : 'bg-gray-800 bg-opacity-50 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              style={{
                boxShadow: isReady
                  ? '0 0 20px rgba(34, 197, 94, 0.3)'
                  : 'none'
              }}
            >
              {isReady ? '✓ Ready' : 'Ready for Rematch'}
            </button>

            <button
              onClick={onBackToLobby}
              className="px-6 py-3 bg-red-500 bg-opacity-20 border-2 border-red-500 text-red-400 rounded-lg font-semibold hover:bg-opacity-30 transition-all"
              style={{
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
              }}
            >
              Leave Game
            </button>
          </div>

          {allReady && (
            <div
              className="text-center text-green-400 font-semibold animate-pulse"
              style={{
                textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
              }}
            >
              🎮 Starting new game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
