import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MR_X_REVEAL_ROUNDS } from '@shared/index';
import { Button } from '../ui';
import { socketService } from '../../services/socket';


interface RoundTrackerProps {
  viewMode: 'svg' | 'mapbox';
  onViewModeChange: (mode: 'svg' | 'mapbox') => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  onLeaveGame: () => void;
}

export function RoundTracker({
  viewMode,
  onViewModeChange,
  showLegend,
  onToggleLegend,
  onLeaveGame,
}: RoundTrackerProps) {
  const { round, getCurrentPlayer, isDoubleMoveActive } = useGameStore();
  const [isStartingDoubleMove, setIsStartingDoubleMove] = useState(false);

  // Show current round and next 4 rounds
  const visibleRounds = Array.from({ length: 5 }, (_, i) => round + i).filter((r) => r <= 24);

  const currentPlayer = getCurrentPlayer();
  const myPlayerId = socketService.getSocketId();
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const isMrX = currentPlayer?.role === 'mr-x';
  const hasDoubleMoveTickets = currentPlayer?.tickets.doubleMove && currentPlayer.tickets.doubleMove > 0;
  const canUseDoubleMove = isMyTurn && isMrX && hasDoubleMoveTickets && !isDoubleMoveActive;

  const handleStartDoubleMove = async () => {
    setIsStartingDoubleMove(true);
    try {
      await socketService.startDoubleMove();
    } catch (error) {
      console.error('Failed to start double move:', error);
    } finally {
      setIsStartingDoubleMove(false);
    }
  };

  return (
    <div className="bg-black bg-opacity-60 backdrop-blur-sm border-b border-gray-800 py-3 px-6 relative z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Double Move Button */}
        <div className="w-48">
          {canUseDoubleMove && (
            <button
              onClick={handleStartDoubleMove}
              disabled={isStartingDoubleMove}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 flex items-center gap-2"
              title="Use a double move card to move twice"
            >
              <span className="text-lg">🎯🎯</span>
              <span>Double Move ({currentPlayer?.tickets.doubleMove})</span>
            </button>
          )}
          {isDoubleMoveActive && isMyTurn && isMrX && (
            <div className="px-4 py-2 bg-pink-500 bg-opacity-20 border border-pink-500 text-pink-400 rounded-lg font-semibold text-sm flex items-center gap-2">
              <span className="text-lg animate-pulse">🎯</span>
              <span>Move 1 of 2</span>
            </div>
          )}
        </div>

        {/* Center - Round display */}
        <div className="flex items-center gap-2">
          <div className="text-gray-400 text-sm font-semibold mr-4">Round</div>
          {visibleRounds.map((r) => {
            const isReveal = MR_X_REVEAL_ROUNDS.includes(r);
            const isCurrent = r === round;

            return (
              <div
                key={r}
                className={`relative flex flex-col items-center min-w-[60px] ${
                  isCurrent ? 'scale-110' : ''
                } transition-transform`}
              >
                {/* Round number */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 border-cyan-300 text-white shadow-lg shadow-cyan-500/50'
                      : isReveal
                      ? 'bg-pink-500 bg-opacity-20 border-pink-500 text-pink-400'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
                >
                  {r}
                </div>

                {/* Reveal indicator */}
                {isReveal && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-xs">
                      👁️
                    </div>
                  </div>
                )}

                {/* Label */}
                {isCurrent && (
                  <div className="text-xs text-cyan-400 font-semibold mt-1">Now</div>
                )}
                {isReveal && !isCurrent && (
                  <div className="text-xs text-pink-400 mt-1">Reveal</div>
                )}
              </div>
            );
          })}

          {round + visibleRounds.length < 24 && (
            <div className="text-gray-600 ml-2">→ {24}</div>
          )}
        </div>

        {/* Right side - Settings */}
        <SettingsButton
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          showLegend={showLegend}
          onToggleLegend={onToggleLegend}
          onLeaveGame={onLeaveGame}
        />
      </div>
    </div>
  );
}

// Settings button component
interface SettingsButtonProps {
  viewMode: 'svg' | 'mapbox';
  onViewModeChange: (mode: 'svg' | 'mapbox') => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  onLeaveGame: () => void;
}

function SettingsButton({
  viewMode,
  onViewModeChange,
  showLegend,
  onToggleLegend,
  onLeaveGame,
}: SettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-40">
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-cyan-500 transition-all flex items-center justify-center group relative z-40"
        title="Settings"
      >
        <svg
          className={`w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-all ${
            isOpen ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border border-gray-700 p-4 shadow-xl z-50">
          <h3 className="font-bold text-white mb-3 text-sm">Map View</h3>
          <div className="space-y-2">
            <Button
              onClick={() => {
                onViewModeChange('mapbox');
                setIsOpen(false);
              }}
              variant="primary"
              size="md"
              fullWidth
              active={viewMode === 'mapbox'}
              className="justify-start"
            >
              <span className="text-xl">🗺️</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">Mapbox</div>
                <div className="text-xs opacity-75">Real London map</div>
              </div>
              {viewMode === 'mapbox' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </Button>
            <Button
              onClick={() => {
                onViewModeChange('svg');
                setIsOpen(false);
              }}
              variant="primary"
              size="md"
              fullWidth
              active={viewMode === 'svg'}
              className="justify-start"
            >
              <span className="text-xl">📊</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">SVG</div>
                <div className="text-xs opacity-75">Classic board view</div>
              </div>
              {viewMode === 'svg' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </Button>
          </div>

          {/* Transport Legend Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                onToggleLegend();
              }}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition flex items-center gap-3 bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <span className="text-xl">🎨</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">Transport Legend</div>
                <div className="text-xs opacity-75">{showLegend ? 'Hide' : 'Show'} legend</div>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition ${
                  showLegend ? 'bg-cyan-500' : 'bg-gray-600'
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    showLegend ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Leave Game */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                onLeaveGame();
                setIsOpen(false);
              }}
              variant="outline"
              size="md"
              fullWidth
              className="justify-start border-red-500 text-red-400 hover:border-red-400 bg-red-500 bg-opacity-20 hover:bg-opacity-30"
            >
              <span className="text-xl">🚪</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">Leave Game</div>
                <div className="text-xs opacity-75">Return to lobby</div>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
