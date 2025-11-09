import { useState } from 'react';
import type { TransportType } from '@shared/types/board';
import { useGameStore } from '../../store/gameStore';
import { TRANSPORT_INFO } from '@shared';
import { Button, Card } from '../ui';
import { socketService } from '../../services/socket';

interface TransportModalProps {
  stationId: number;
  availableTransports: TransportType[];
  onClose: () => void;
}

export function TransportModal({ stationId, availableTransports, onClose }: TransportModalProps) {
  const makeMove = useGameStore((state) => state.makeMove);
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());
  const isDoubleMoveActive = useGameStore((state) => state.isDoubleMoveActive);
  const [isStartingDoubleMove, setIsStartingDoubleMove] = useState(false);

  if (!currentPlayer) return null;

  const isMrX = currentPlayer.role === 'mr-x';
  const hasDoubleMoveTickets = currentPlayer.tickets.doubleMove > 0;
  const canUseDoubleMove = isMrX && hasDoubleMoveTickets && !isDoubleMoveActive;

  const handleTransportSelect = (transport: TransportType) => {
    makeMove(stationId, transport);
    onClose();
  };

  const handleStartDoubleMove = async () => {
    setIsStartingDoubleMove(true);
    try {
      const response = await socketService.startDoubleMove();
      if (response.success) {
        // Keep modal open so they can make their first move
      } else {
        console.error('Failed to start double move:', response.error);
      }
    } catch (error) {
      console.error('Failed to start double move:', error);
    } finally {
      setIsStartingDoubleMove(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl max-w-md w-full pointer-events-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Select Transport</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Moving to Station {stationId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Transport Options */}
          <div className="p-4 space-y-2">
            {/* Double Move Option (Mr. X only) */}
            {canUseDoubleMove && (
              <>
                <button
                  onClick={handleStartDoubleMove}
                  disabled={isStartingDoubleMove}
                  className="w-full p-4 rounded-lg border-2 border-pink-500 bg-pink-500 bg-opacity-10 hover:bg-opacity-20 transition flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: '0 0 30px rgba(236, 72, 153, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl bg-pink-500 bg-opacity-20">
                      🎯🎯
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg group-hover:scale-105 transition-transform">
                        Double Move
                      </div>
                      <div className="text-sm text-pink-400">
                        Move twice in one turn • {currentPlayer.tickets.doubleMove} remaining
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-pink-500 group-hover:text-pink-400 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-black text-gray-500">OR</span>
                  </div>
                </div>
              </>
            )}

            {/* Regular Transport Options */}
            {availableTransports.map((transport) => {
              const info = TRANSPORT_INFO[transport];
              const ticketCount = currentPlayer.tickets[transport];

              return (
                <button
                  key={transport}
                  onClick={() => handleTransportSelect(transport)}
                  className="w-full p-4 rounded-lg border border-gray-700 hover:border-gray-500 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition flex items-center justify-between group"
                  style={{
                    boxShadow: `0 0 20px ${info.color}20`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: `${info.color}20`,
                      }}
                    >
                      {info.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg group-hover:scale-105 transition-transform">
                        {info.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {ticketCount > 99 ? 'Unlimited' : `${ticketCount} tickets remaining`}
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-500 group-hover:text-white transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              variant="ghost"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
