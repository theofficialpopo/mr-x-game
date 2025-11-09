import { useState } from 'react';
import { Button } from '../ui';

interface JoinGameFormProps {
  initialGameId?: string;
  onJoin: (gameId: string) => void;
  onBack: () => void;
  isConnecting: boolean;
  error?: string;
}

/**
 * Form for entering game ID to join an existing game
 */
export function JoinGameForm({ initialGameId, onJoin, onBack, isConnecting, error }: JoinGameFormProps) {
  const [gameId, setGameId] = useState(initialGameId || '');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Join Game</h2>

          <input
            type="text"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition uppercase font-mono text-center text-xl text-white placeholder-gray-400"
            maxLength={6}
          />

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => onJoin(gameId.trim())}
              disabled={isConnecting || !gameId.trim()}
              variant="secondary"
              size="lg"
              fullWidth
              glow={!isConnecting && !!gameId.trim()}
            >
              {isConnecting ? 'Joining...' : 'Join'}
            </Button>
            <Button
              onClick={onBack}
              disabled={isConnecting}
              variant="ghost"
              size="lg"
              fullWidth
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
