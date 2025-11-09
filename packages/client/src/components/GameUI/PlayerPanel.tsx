import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Player } from '@shared/types/game';
import { TRANSPORT_COLORS, TRANSPORT_ICONS } from '@shared';

export function PlayerPanel() {
  const { players, currentPlayerIndex } = useGameStore();
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  return (
    <div className="absolute top-20 left-4 w-72 space-y-2 z-20">
      {players.map((player: Player, index: number) => {
        const isCurrent = index === currentPlayerIndex;
        const isExpanded = expandedPlayerId === player.id;

        return (
          <div
            key={player.id}
            onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
            className={`bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-3 border transition-all cursor-pointer ${
              isCurrent
                ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            {/* Collapsed View */}
            <div className="flex items-center gap-3">
              {/* Current Turn Indicator */}
              {isCurrent && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse flex-shrink-0" />
              )}

              {/* Player Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0 ${
                  player.role === 'mr-x'
                    ? 'bg-pink-500 bg-opacity-20 border-pink-500 text-pink-400'
                    : 'bg-cyan-500 bg-opacity-20 border-cyan-500 text-cyan-400'
                }`}
              >
                {player.role === 'mr-x' ? '❓' : '🔍'}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">
                  {player.name}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`${
                      player.role === 'mr-x' ? 'text-pink-400' : 'text-cyan-400'
                    }`}
                  >
                    {player.role === 'mr-x' ? 'Mr. X' : 'Detective'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    {player.role === 'mr-x' && !player.isRevealed
                      ? 'Hidden'
                      : `#${player.position}`}
                  </span>
                </div>
              </div>

              {/* Expand Indicator */}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Expanded View - Tickets */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Tickets
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['taxi', 'bus', 'underground', 'water'] as const).map((transport) => (
                    <div
                      key={transport}
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-700"
                      style={{
                        backgroundColor: `${TRANSPORT_COLORS[transport]}10`,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-base"
                        style={{
                          backgroundColor: `${TRANSPORT_COLORS[transport]}30`,
                        }}
                      >
                        {TRANSPORT_ICONS[transport]}
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white">
                          {player.tickets[transport] > 99
                            ? '∞'
                            : player.tickets[transport]}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Black tickets (Mr. X only) */}
                  {player.role === 'mr-x' && player.tickets.black > 0 && (
                    <div
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-700"
                      style={{
                        backgroundColor: `${TRANSPORT_COLORS['black']}10`,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-base"
                        style={{
                          backgroundColor: `${TRANSPORT_COLORS['black']}30`,
                        }}
                      >
                        {TRANSPORT_ICONS['black']}
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white">
                          {player.tickets.black}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Double move tickets (Mr. X only) */}
                  {player.role === 'mr-x' && player.tickets.doubleMove > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-pink-500 bg-pink-500 bg-opacity-10">
                      <div className="w-7 h-7 rounded flex items-center justify-center text-base bg-pink-500 bg-opacity-30">
                        🎯🎯
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white">
                          {player.tickets.doubleMove}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
