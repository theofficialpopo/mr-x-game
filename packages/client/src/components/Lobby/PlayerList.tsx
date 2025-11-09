import type { LobbyPlayer } from '@shared';

interface PlayerListProps {
  players: LobbyPlayer[];
  maxPlayers: number;
}

/**
 * Displays the list of players in the lobby with their ready status
 */
export function PlayerList({ players, maxPlayers }: PlayerListProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 uppercase tracking-wide">
        Players ({players.length}/{maxPlayers})
      </p>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 bg-cyan-500 bg-opacity-20 border-cyan-500">
                🔍
              </div>
              <div>
                <p className="font-semibold">{player.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {player.isHost && (
                <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-400 text-xs rounded-full font-semibold">
                  Host
                </span>
              )}
              {player.isReady && (
                <span className="px-3 py-1 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 text-xs rounded-full font-semibold">
                  ✓ Ready
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
