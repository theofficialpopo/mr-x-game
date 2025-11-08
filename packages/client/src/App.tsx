import { useEffect, useState } from 'react';
import { Lobby } from './components/GameUI/Lobby';
import { RoundTracker } from './components/GameUI/RoundTracker';
import { PlayerPanel } from './components/GameUI/PlayerPanel';
import { TransportLegend } from './components/GameUI/TransportLegend';
import { GameBoard } from './components/Board/GameBoard';
import { GameOver } from './components/GameUI/GameOver';
import { useBoardData } from './hooks/useBoardData';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socket';

type ViewMode = 'svg' | 'mapbox';

function App() {
  const { boardData, board, loading, error } = useBoardData();
  const { phase, setBoard, initializeWebSocket, cleanupWebSocket, resetGame } = useGameStore();
  const [viewMode, setViewMode] = useState<ViewMode>('svg');
  const [showLegend, setShowLegend] = useState(true);

  const handleBackToLobby = () => {
    socketService.leaveGame();
    resetGame();
  };

  // Set board reference in game store when loaded
  useEffect(() => {
    if (board) {
      setBoard(board);
    }
  }, [board, setBoard]);

  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket();

    return () => {
      cleanupWebSocket();
    };
  }, [initializeWebSocket, cleanupWebSocket]);

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

  // Show lobby screen
  if (phase === 'setup') {
    return <Lobby onGameStart={() => {}} />;
  }

  // Show game board with new layout
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Round Tracker with Settings */}
      <RoundTracker
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(!showLegend)}
      />

      {/* Main Game Area */}
      <div className="flex-1 relative">
        {/* Left Player Panel */}
        <PlayerPanel />

        {/* Game Board */}
        <GameBoard
          stations={boardData.stations}
          connections={boardData.connections}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Transport Legend - Bottom Right */}
        <TransportLegend visible={showLegend} />

        {/* Game Over Overlay */}
        {phase === 'finished' && (
          <GameOver onBackToLobby={handleBackToLobby} />
        )}
      </div>
    </div>
  );
}

export default App;
