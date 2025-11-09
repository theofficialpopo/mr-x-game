import { useState, useEffect } from 'react';
import { MapboxBoard } from './MapboxBoard';
import { SVGBoard } from './SVGBoard';
import { TransportModal } from '../GameUI/TransportModal';
import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socket';
import type { Station, Connection } from '@shared/types/board';
import type { TransportType } from '@shared/types/board';
import type { Player } from '@shared/types/game';

type ViewMode = 'svg' | 'mapbox';

interface GameBoardProps {
  stations: Station[];
  connections: Connection[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function GameBoard({
  stations,
  connections,
  viewMode,
}: GameBoardProps) {
  const { players, phase, getValidMoves, isMrXRevealed, currentPlayerIndex, round } = useGameStore();
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [availableTransports, setAvailableTransports] = useState<TransportType[]>([]);
  const [highlightedStations, setHighlightedStations] = useState<number[]>([]);

  const validMoves = getValidMoves();
  const isRevealed = isMrXRevealed();

  // Highlight valid move destinations and player positions
  useEffect(() => {
    if (phase !== 'playing') {
      setHighlightedStations([]);
      return;
    }

    // Get valid move destinations
    const validStationIds = validMoves.map((m) => m.stationId);

    // Get player positions to highlight
    const playerPositions = players
      .filter((p: Player) => {
        // Show all detective positions
        if (p.role === 'detective') return true;
        // Show Mr. X only when revealed
        if (p.role === 'mr-x') return isRevealed;
        return false;
      })
      .map((p: Player) => p.position)
      .filter(pos => pos !== -1); // Filter out hidden positions

    // Combine and deduplicate
    const combined = [...new Set([...validStationIds, ...playerPositions])];
    setHighlightedStations(combined);
    // Only depend on things that actually change, not the derived arrays
  }, [currentPlayerIndex, phase, round, players.length]);

  const handleStationClick = (stationId: number) => {
    if (phase !== 'playing') {
      console.log('[Click] Game not in playing phase:', phase);
      return;
    }

    // Check if it's the local player's turn
    const currentPlayer = useGameStore.getState().getCurrentPlayer();
    const myPlayerId = socketService.getSocketId();

    console.log('[Click] Station clicked:', stationId);
    console.log('[Click] Current player:', currentPlayer?.name, currentPlayer?.id);
    console.log('[Click] Current player full data:', currentPlayer);
    console.log('[Click] Current player tickets:', currentPlayer?.tickets);
    console.log('[Click] Current player tickets type:', typeof currentPlayer?.tickets);
    console.log('[Click] My player ID (socket ID):', myPlayerId);
    console.log('[Click] All players:', players.map(p => ({ name: p.name, id: p.id, role: p.role })));

    if (!currentPlayer || currentPlayer.id !== myPlayerId) {
      // Not your turn - ignore the click
      console.log('[Click] Not your turn - currentPlayer.id:', currentPlayer?.id, 'myPlayerId:', myPlayerId);
      return;
    }

    // Check if this is a valid move
    const validMove = validMoves.find((m) => m.stationId === stationId);

    console.log('[Click] Valid moves:', validMoves);
    console.log('[Click] Looking for station:', stationId);
    console.log('[Click] Found valid move:', validMove);

    if (validMove) {
      // Always show modal to select transport (even with single option)
      console.log('[Click] Opening transport modal for station:', stationId, 'with transports:', validMove.transports);
      setSelectedStation(stationId);
      setAvailableTransports(validMove.transports);
    } else {
      console.log('[Click] Station', stationId, 'is not a valid move. Current position:', currentPlayer?.position);
    }
  };

  const handleCloseModal = () => {
    setSelectedStation(null);
    setAvailableTransports([]);
  };

  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());

  return (
    <div className="absolute inset-0">
      {viewMode === 'mapbox' ? (
        <MapboxBoard
          stations={stations}
          connections={connections}
          onStationClick={handleStationClick}
          highlightedStations={highlightedStations}
          players={players}
          isMrXRevealed={isRevealed}
        />
      ) : (
        <SVGBoard
          stations={stations}
          connections={connections}
          onStationClick={handleStationClick}
          highlightedStations={highlightedStations}
          players={players}
          isMrXRevealed={isRevealed}
          currentPlayerId={currentPlayer?.id}
        />
      )}

      {selectedStation && availableTransports.length > 0 && (
        <TransportModal
          stationId={selectedStation}
          availableTransports={availableTransports}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
