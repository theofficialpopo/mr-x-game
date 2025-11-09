import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Player } from '@shared/types/game';
import { TRANSPORT_COLORS, TRANSPORT_ICONS } from '@shared';
import { Card, Avatar, Icons } from '../../design-system';

export function PlayerPanel() {
  const { players, currentPlayerIndex } = useGameStore();
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  // Transport color backgrounds (using opacity values)
  const transportBackgrounds = {
    taxi: 'bg-[#FFD700] bg-opacity-10',
    bus: 'bg-[#32CD32] bg-opacity-10',
    underground: 'bg-[#FF1493] bg-opacity-10',
    water: 'bg-[#00CED1] bg-opacity-10',
  };

  const transportIconBackgrounds = {
    taxi: 'bg-[#FFD700] bg-opacity-30',
    bus: 'bg-[#32CD32] bg-opacity-30',
    underground: 'bg-[#FF1493] bg-opacity-30',
    water: 'bg-[#00CED1] bg-opacity-30',
  };

  return (
    <div className="absolute top-20 left-4 w-72 space-y-2 z-20">
      {players.map((player: Player, index: number) => {
        const isCurrent = index === currentPlayerIndex;
        const isExpanded = expandedPlayerId === player.id;

        return (
          <Card
            key={player.id}
            onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
            variant={isCurrent ? 'primary' : 'default'}
            padding="sm"
            className={`transition-all cursor-pointer ${
              isCurrent ? 'shadow-glow-cyan' : 'hover:border-gray-600'
            }`}
          >
            {/* Collapsed View */}
            <div className="flex items-center gap-3">
              {/* Current Turn Indicator */}
              {isCurrent && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse flex-shrink-0" />
              )}

              {/* Player Icon */}
              <Avatar
                variant={player.role === 'mr-x' ? 'mrx' : 'detective'}
                size="md"
              >
                {player.role === 'mr-x' ? '❓' : <Icons.search size={16} />}
              </Avatar>

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
              <Icons.chevronDown
                size={20}
                className={`text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
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
                      className={`flex items-center gap-2 p-2 rounded-lg border border-gray-700 ${transportBackgrounds[transport]}`}
                    >
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center text-base ${transportIconBackgrounds[transport]}`}
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
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
