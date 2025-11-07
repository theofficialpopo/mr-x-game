import { useState } from 'react';
import { SVGBoard } from './components/Board/SVGBoard';
import { useBoardData } from './hooks/useBoardData';

function App() {
  const { boardData, board, loading, error } = useBoardData();
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [highlightedStations, setHighlightedStations] = useState<number[]>([]);

  const handleStationClick = (stationId: number) => {
    setSelectedStation(stationId);

    if (board) {
      // Highlight all connected stations (for all transport types)
      const allTransports = board.getAvailableTransports(stationId);
      const connected = allTransports.flatMap((transport) =>
        board.getValidMoves(stationId, transport)
      );
      setHighlightedStations([stationId, ...connected]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Loading Scotland Yard board...</p>
        </div>
      </div>
    );
  }

  if (error || !boardData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Error</h1>
          <p className="text-gray-400 mb-4">{error || 'Failed to load board data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              Mr. X Game
            </h1>
            <p className="text-sm text-gray-400">Scotland Yard - Phase 1: Board Visualization</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">
              <span className="text-cyan-400 font-semibold">{boardData.stations.length}</span> stations
              <span className="mx-2">•</span>
              <span className="text-pink-400 font-semibold">{boardData.connections.length}</span> connections
            </div>
            {selectedStation && (
              <div className="text-sm text-gray-300 mt-1">
                Selected: Station <span className="font-bold text-white">{selectedStation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="h-[calc(100vh-80px)]">
        <SVGBoard
          stations={boardData.stations}
          connections={boardData.connections}
          onStationClick={handleStationClick}
          highlightedStations={highlightedStations}
        />
      </div>

      {/* Instructions overlay */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 max-w-sm border border-gray-700">
        <h3 className="font-bold text-cyan-400 mb-2">🎮 Phase 1 Complete!</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ 199 stations loaded and rendered</li>
          <li>✅ 559 connections visualized</li>
          <li>✅ Transport types color-coded</li>
          <li>💡 Click any station to see connections</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Next: Add Mapbox integration (Week 2)
        </p>
      </div>
    </div>
  );
}

export default App;
