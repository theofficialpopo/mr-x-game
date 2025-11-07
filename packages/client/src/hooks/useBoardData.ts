import { useState, useEffect } from 'react';
import { parseBoardData, validateBoardData, Board, CoordinateMapper } from '@shared/index';
import type { BoardData } from '@shared/types/board';

interface UseBoardDataResult {
  boardData: BoardData | null;
  board: Board | null;
  coordinateMapper: CoordinateMapper | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to load and parse Scotland Yard board data
 */
export function useBoardData(): UseBoardDataResult {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [coordinateMapper, setCoordinateMapper] = useState<CoordinateMapper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both data files
        const [stationsResponse, connectionsResponse] = await Promise.all([
          fetch('/data/stations.txt'),
          fetch('/data/connections.txt'),
        ]);

        if (!stationsResponse.ok || !connectionsResponse.ok) {
          throw new Error('Failed to load board data files');
        }

        const stationsText = await stationsResponse.text();
        const connectionsText = await connectionsResponse.text();

        // Parse the data
        const parsed = parseBoardData(stationsText, connectionsText);

        // Validate the data
        const validation = validateBoardData(parsed);
        if (!validation.valid) {
          console.error('Board data validation errors:', validation.errors);
          throw new Error(`Invalid board data: ${validation.errors.join(', ')}`);
        }

        // Create Board instance
        const boardInstance = new Board();
        boardInstance.initialize(parsed.stations, parsed.connections);

        // Create CoordinateMapper instance
        const mapper = new CoordinateMapper();

        // Add geographic coordinates to stations
        const stationsWithGeo = parsed.stations.map((station) => ({
          ...station,
          geoCoordinates: mapper.boardToGeo(station.position.x, station.position.y),
        }));

        const boardDataWithGeo: BoardData = {
          stations: stationsWithGeo,
          connections: parsed.connections,
        };

        setBoardData(boardDataWithGeo);
        setBoard(boardInstance);
        setCoordinateMapper(mapper);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error loading board data';
        setError(message);
        console.error('Error loading board data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBoardData();
  }, []);

  return {
    boardData,
    board,
    coordinateMapper,
    loading,
    error,
  };
}
