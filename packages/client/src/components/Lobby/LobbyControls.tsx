import { Button } from '../ui';
import type { LobbyPlayer } from '@shared';

interface LobbyControlsProps {
  isHost: boolean;
  isPlayerReady: boolean;
  canStart: boolean;
  players: LobbyPlayer[];
  allReady: boolean;
  onReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

/**
 * Control buttons for lobby (Ready, Start Game, Leave)
 */
export function LobbyControls({
  isHost,
  isPlayerReady,
  canStart,
  players,
  allReady,
  onReady,
  onStartGame,
  onLeave,
}: LobbyControlsProps) {
  return (
    <div className="flex gap-3">
      {!isHost && (
        <Button
          onClick={onReady}
          variant={isPlayerReady ? "primary" : "ghost"}
          size="lg"
          fullWidth
          active={isPlayerReady}
          glow={isPlayerReady}
        >
          {isPlayerReady ? '✓ Ready' : 'Ready Up'}
        </Button>
      )}

      {isHost && (
        <Button
          onClick={onStartGame}
          disabled={!canStart}
          variant="primary"
          size="lg"
          fullWidth
          glow={canStart}
        >
          {players.length < 2
            ? 'Waiting for players...'
            : !allReady
            ? 'Waiting for ready...'
            : 'Start Game'}
        </Button>
      )}

      <Button
        onClick={onLeave}
        variant="outline"
        size="lg"
        className="border-red-500 text-red-400 hover:border-red-400 bg-red-500 bg-opacity-20 hover:bg-opacity-30"
        style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}
      >
        Leave
      </Button>
    </div>
  );
}
