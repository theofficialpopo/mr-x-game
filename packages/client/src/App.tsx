import { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Lobby } from './components/GameUI/Lobby';
import { RoundTracker } from './components/GameUI/RoundTracker';
import { PlayerPanel } from './components/GameUI/PlayerPanel';
import { TransportLegend } from './components/GameUI/TransportLegend';
import { MoveHistoryClipboard } from './components/GameUI/MoveHistoryClipboard';
import { GameBoard } from './components/Board/GameBoard';
import { GameOver } from './components/GameUI/GameOver';
import { useBoardData } from './hooks/useBoardData';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socket';
import { getSession, hasActiveSessionForGame, initializeSessionCleanup, clearSession } from './services/session';

type ViewMode = 'svg' | 'mapbox';

// Game container component - handles all game logic
function GameContainer({ gameIdFromUrl }: { gameIdFromUrl?: string }) {
  const { boardData, board, loading, error } = useBoardData();
  const { phase, setBoard, initializeWebSocket, cleanupWebSocket, resetGame } = useGameStore();
  const [viewMode, setViewMode] = useState<ViewMode>('svg');
  const [showLegend, setShowLegend] = useState(true);
  const navigate = useNavigate();

  const handleBackToLobby = async () => {
    await socketService.leaveGame();
    clearSession();
    resetGame();
    navigate('/');
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
    return <Lobby onGameStart={() => {}} initialGameId={gameIdFromUrl} />;
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
        onLeaveGame={handleBackToLobby}
      />

      {/* Main Game Area */}
      <div className="flex-1 relative">
        {/* Left Player Panel */}
        <PlayerPanel />

        {/* Right Move History Clipboard */}
        <MoveHistoryClipboard />

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

// Wrapper component to extract gameId from URL params
function GameWithParams() {
  const { gameId } = useParams<{ gameId: string }>();
  return <GameContainer gameIdFromUrl={gameId} />;
}

// Main App component with routing
function App() {
  // Initialize session cleanup on app mount
  useEffect(() => {
    initializeSessionCleanup();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<GameContainer />} />
      <Route path="/:gameId" element={<GameWithParams />} />
    </Routes>
  );
}

export default App;
