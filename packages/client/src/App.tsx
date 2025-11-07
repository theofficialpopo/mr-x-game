import { useState } from 'react';
import { SVGBoard } from './components/Board/SVGBoard';
import { MapboxBoard } from './components/Board/MapboxBoard';
import { useBoardData } from './hooks/useBoardData';

type ViewMode = 'svg' | 'mapbox';

function App() {
  const { boardData, board, loading, error } = useBoardData();
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [highlightedStations, setHighlightedStations] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('mapbox');

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
            <p className="text-sm text-gray-400">
              Scotland Yard - Phase 1: {viewMode === 'mapbox' ? 'Mapbox' : 'SVG'} View
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('svg')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'svg'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                SVG
              </button>
              <button
                onClick={() => setViewMode('mapbox')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'mapbox'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mapbox
              </button>
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
      </div>

      {/* Board */}
      <div className="h-[calc(100vh-80px)]">
        {viewMode === 'svg' ? (
          <SVGBoard
            stations={boardData.stations}
            connections={boardData.connections}
            onStationClick={handleStationClick}
            highlightedStations={highlightedStations}
          />
        ) : (
          <MapboxBoard
            stations={boardData.stations}
            connections={boardData.connections}
            onStationClick={handleStationClick}
            highlightedStations={highlightedStations}
          />
        )}
      </div>

      {/* Instructions overlay */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 max-w-sm border border-gray-700">
        <h3 className="font-bold text-cyan-400 mb-2">
          {viewMode === 'mapbox' ? '🗺️ Mapbox View' : '📊 SVG View'}
        </h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ {boardData.stations.length} stations rendered</li>
          <li>✅ {boardData.connections.length} connections visualized</li>
          <li>✅ Transport types color-coded</li>
          <li>💡 Click any station to see connections</li>
          {viewMode === 'mapbox' && (
            <>
              <li>🗺️ Real London map background</li>
              <li>🔍 Zoom and pan to explore</li>
            </>
          )}
        </ul>
        <p className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
          🎉 Phase 1 Complete! Toggle views above.
        </p>
      </div>
    </div>
  );
}

export default App;
