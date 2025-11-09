import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socket';
import { useState, useEffect } from 'react';
import { Button, Card, Badge, Avatar, Icons } from '../../design-system';

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
        <Card
          variant={winner === 'mr-x' ? 'secondary' : 'primary'}
          padding="lg"
          elevated
          className={`space-y-6 border-2 ${colors.border} ${
            winner === 'mr-x' ? 'shadow-glow-pink' : 'shadow-glow-cyan'
          }`}
        >

          {/* Winner Announcement */}
          <div className="text-center space-y-4">
            <h1
              className={`text-6xl font-bold ${didIWin ? 'text-green-400' : 'text-red-400'} ${
                didIWin ? 'text-shadow-glow-green' : 'text-shadow-glow-red'
              }`}
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

                return (
                  <Card
                    key={player.id}
                    variant={playerWon ? 'success' : 'danger'}
                    padding="sm"
                    className={`transition-all ${
                      playerWon ? 'shadow-glow-green' : 'shadow-glow-red'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Role Icon */}
                      <Avatar
                        variant={player.role === 'mr-x' ? 'mrx' : 'detective'}
                        size="md"
                      >
                        {player.role === 'mr-x' ? '❓' : <Icons.search size={16} />}
                      </Avatar>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {player.name}
                        </p>
                        <p className={`text-xs ${ROLE_COLORS[player.role].text}`}>
                          {player.role === 'mr-x' ? 'Mr. X' : 'Detective'}
                        </p>
                      </div>

                      {/* Ready Badge */}
                      {playerReady && (
                        <Badge variant="success" size="sm">
                          <Icons.check size={12} />
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReady}
              variant={isReady ? 'success' : 'neutral'}
              size="lg"
              glow={isReady}
              className="flex-1"
            >
              {isReady ? (
                <>
                  <Icons.check size={20} />
                  Ready
                </>
              ) : (
                <>
                  <Icons.refresh size={20} />
                  Ready for Rematch
                </>
              )}
            </Button>

            <Button
              onClick={onBackToLobby}
              variant="danger"
              size="lg"
              className="shadow-glow-red"
            >
              Leave Game
            </Button>
          </div>

          {allReady && (
            <div className="text-center text-green-400 font-semibold animate-pulse text-shadow-glow-green">
              <Icons.play size={20} className="inline mr-2" />
              Starting new game...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
