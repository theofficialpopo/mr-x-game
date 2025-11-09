import { useState } from 'react';
import { Button } from '../ui';

interface LobbyMenuProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (playerName: string) => void;
  error?: string;
}

/**
 * Main lobby menu for entering name and choosing create/join
 */
export function LobbyMenu({ onCreateGame, onJoinGame, error }: LobbyMenuProps) {
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2" style={{ textShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}>
            Scotland Yard
          </h1>
          <p className="text-gray-400">A game of cat and mouse through London</p>
        </div>

        <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Play Online</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 transition text-white placeholder-gray-400"
            maxLength={20}
          />

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={() => onCreateGame(playerName.trim())}
            disabled={!playerName.trim()}
            variant="primary"
            size="lg"
            fullWidth
            glow={!!playerName.trim()}
          >
            Create Game
          </Button>

          <Button
            onClick={() => onJoinGame(playerName.trim())}
            disabled={!playerName.trim()}
            variant="secondary"
            size="lg"
            fullWidth
            glow={!!playerName.trim()}
          >
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
}
