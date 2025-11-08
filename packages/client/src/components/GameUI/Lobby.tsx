import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socket';
import { setGameId as saveGameIdToSession, setPlayerName as savePlayerNameToSession, getSession, hasActiveSessionForGame, clearSession } from '../../services/session';
import type { LobbyState } from '@shared';

interface LobbyProps {
  onGameStart: () => void;
  initialGameId?: string;
}

export function Lobby({ onGameStart, initialGameId }: LobbyProps) {
  const navigate = useNavigate();

  // Check if we should auto-reconnect
  const session = getSession();
  const shouldAutoReconnect = initialGameId && hasActiveSessionForGame(initialGameId);

  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting'>(
    shouldAutoReconnect ? 'waiting' : (initialGameId ? 'join' : 'menu')
  );
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState(initialGameId || '');
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(shouldAutoReconnect);

  useEffect(() => {
    // Listen for lobby updates
    socketService.onLobbyUpdated((lobbyState) => {
      setLobby(lobbyState);
      setMode('waiting');
      setError('');
    });

    // Listen for lobby errors
    socketService.onLobbyError((err) => {
      setError(err);
      setIsConnecting(false);
    });

    return () => {
      socketService.offLobbyEvents();
    };
  }, []);

  // Auto-reconnect from main lobby or game URL
  useEffect(() => {
    const tryReconnect = async () => {
      const session = getSession();

      // If on main lobby and have active session, redirect to game URL
      if (!initialGameId && session.gameId && session.playerName) {
        console.log(`[Reconnect] Found active session for game ${session.gameId}, redirecting...`);
        navigate(`/${session.gameId}`);
        return;
      }

      // If on game URL, check if we have a valid session
      if (initialGameId) {
        const hasSession = session.gameId === initialGameId && session.playerName !== null;

        if (!hasSession) {
          // No valid session for this game - redirect to lobby
          console.log(`[Reconnect] No valid session for game ${initialGameId}, redirecting to lobby`);
          navigate('/');
          return;
        }

        // Have valid session - try to reconnect
        if (session.playerName) {
          console.log(`[Reconnect] Attempting to rejoin game ${initialGameId} as ${session.playerName}`);
          setIsConnecting(true);

          // Wait for socket to connect if not connected
          let attempts = 0;
          while (!socketService.isConnected() && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!socketService.isConnected()) {
            console.log('[Reconnect] Connection timeout - clearing session and redirecting to lobby');
            clearSession();
            navigate('/');
            return;
          }

          // Automatically join the game
          const response = await socketService.joinGame(initialGameId, session.playerName);

          if (!response.success) {
            console.log('[Reconnect] Failed:', response.error, '- clearing session and redirecting to lobby');
            clearSession();
            navigate('/');
          } else {
            console.log('[Reconnect] Success!');
          }
        }
      }
    };

    tryReconnect();
  }, [initialGameId, navigate]);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsConnecting(true);
    setError('');

    console.log('[Lobby] Creating game for player:', playerName.trim());
    const response = await socketService.createGame(playerName.trim());

    if (response.success && response.gameId) {
      console.log('[Lobby] Game created:', response.gameId);
      // Save to session for reconnection
      saveGameIdToSession(response.gameId);
      savePlayerNameToSession(playerName.trim());
      // Also set local state
      setGameId(response.gameId);
      // Navigate to game URL
      navigate(`/${response.gameId}`);
      console.log('[Lobby] Navigated to game URL');
      // Lobby update will come via socket event
    } else {
      setError(response.error || 'Failed to create game');
      setIsConnecting(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!gameId.trim()) {
      setError('Please enter game ID');
      return;
    }

    setIsConnecting(true);
    setError('');

    console.log('[Lobby] Joining game:', gameId.trim().toUpperCase(), 'as', playerName.trim());
    const response = await socketService.joinGame(gameId.trim().toUpperCase(), playerName.trim());

    if (response.success) {
      const normalizedGameId = gameId.trim().toUpperCase();
      console.log('[Lobby] Successfully joined game:', normalizedGameId);
      // Save to session for reconnection
      saveGameIdToSession(normalizedGameId);
      savePlayerNameToSession(playerName.trim());
      // Navigate to game URL
      navigate(`/${normalizedGameId}`);
      console.log('[Lobby] Navigated to game URL');
      // Lobby update will come via socket event
    } else {
      setError(response.error || 'Failed to join game');
      setIsConnecting(false);
    }
  };

  const handleReady = () => {
    if (!lobby) return;

    const me = lobby.players.find(p => p.id === socketService.getSocketId());
    if (!me) return;

    socketService.setReady(!me.isReady);
  };

  const handleStartGame = () => {
    socketService.startGame();
  };

  const handleLeave = () => {
    socketService.leaveGame();
    setMode('menu');
    setLobby(null);
    setGameId('');
    setError('');
  };

  // Game start is handled by the game store's WebSocket listeners

  // Main menu
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-2" style={{ textShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}>
              Scotland Yard
            </h1>
            <p className="text-gray-400">A game of cat and mouse through London</p>
          </div>

          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Play Online</h2>

            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 transition text-white placeholder-gray-400"
              maxLength={20}
            />

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setMode('create')}
              disabled={!playerName.trim()}
              className="w-full px-6 py-3 bg-cyan-500 bg-opacity-20 border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: playerName.trim() ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none' }}
            >
              Create Game
            </button>

            <button
              onClick={() => setMode('join')}
              disabled={!playerName.trim()}
              className="w-full px-6 py-3 bg-purple-500 bg-opacity-20 border-2 border-purple-500 text-purple-400 rounded-lg font-semibold hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: playerName.trim() ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none' }}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create game confirmation
  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Create Game</h2>

            <p className="text-gray-400">
              You will be the host and can start the game once all players are ready.
            </p>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateGame}
                disabled={isConnecting}
                className="flex-1 px-6 py-3 bg-cyan-500 bg-opacity-20 border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold hover:bg-opacity-30 transition disabled:opacity-50"
                style={{ boxShadow: isConnecting ? 'none' : '0 0 20px rgba(6, 182, 212, 0.3)' }}
              >
                {isConnecting ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setMode('menu')}
                disabled={isConnecting}
                className="flex-1 px-6 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join game form
  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Join Game</h2>

            <input
              type="text"
              placeholder="Enter Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition uppercase font-mono text-center text-xl text-white placeholder-gray-400"
              maxLength={6}
            />

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleJoinGame}
                disabled={isConnecting || !gameId.trim()}
                className="flex-1 px-6 py-3 bg-purple-500 bg-opacity-20 border-2 border-purple-500 text-purple-400 rounded-lg font-semibold hover:bg-opacity-30 transition disabled:opacity-50"
                style={{ boxShadow: isConnecting || !gameId.trim() ? 'none' : '0 0 20px rgba(168, 85, 247, 0.3)' }}
              >
                {isConnecting ? 'Joining...' : 'Join'}
              </button>
              <button
                onClick={() => {
                  setMode('menu');
                  setGameId('');
                  setError('');
                }}
                disabled={isConnecting}
                className="flex-1 px-6 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen while reconnecting
  if (mode === 'waiting' && !lobby) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-gray-700">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-2">Reconnecting...</h2>
              <p className="text-gray-400">Joining game {gameId}</p>
              {playerName && <p className="text-gray-400 mt-2">as {playerName}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting lobby
  if (mode === 'waiting' && lobby) {
    const me = lobby.players.find(p => p.id === socketService.getSocketId());
    const isHost = me?.isHost ?? false;
    const allReady = lobby.players.every(p => p.isReady || p.isHost);
    const canStart = isHost && lobby.players.length >= 2 && allReady;

    const handleCopyInvite = () => {
      const inviteUrl = `${window.location.origin}/${lobby.gameId}`;
      navigator.clipboard.writeText(inviteUrl);
      // You could add a toast notification here
    };

    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Game Lobby</h2>
              <div className="text-center">
                <p className="text-sm text-gray-400">Game ID</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">{lobby.gameId}</p>
              </div>
            </div>

            {/* Copy Invite Button */}
            <button
              onClick={handleCopyInvite}
              className="w-full px-4 py-3 bg-purple-500 bg-opacity-20 border border-purple-500 text-purple-400 rounded-lg font-semibold hover:bg-opacity-30 transition flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Invite Link
            </button>

            <div className="space-y-2">
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                Players ({lobby.players.length}/{lobby.maxPlayers})
              </p>
              <div className="space-y-2">
                {lobby.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 bg-cyan-500 bg-opacity-20 border-cyan-500">
                        🔍
                      </div>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isHost && (
                        <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-400 text-xs rounded-full font-semibold">
                          Host
                        </span>
                      )}
                      {player.isReady && (
                        <span className="px-3 py-1 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 text-xs rounded-full font-semibold">
                          ✓ Ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {!isHost && (
                <button
                  onClick={handleReady}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition border-2 ${
                    me?.isReady
                      ? 'bg-green-500 bg-opacity-20 border-green-500 text-green-400 hover:bg-opacity-30'
                      : 'bg-gray-800 bg-opacity-50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  style={{
                    boxShadow: me?.isReady ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none'
                  }}
                >
                  {me?.isReady ? '✓ Ready' : 'Ready Up'}
                </button>
              )}

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className="flex-1 px-6 py-3 bg-cyan-500 bg-opacity-20 border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold hover:bg-opacity-30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: canStart ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none' }}
                >
                  {lobby.players.length < 2
                    ? 'Waiting for players...'
                    : !allReady
                    ? 'Waiting for ready...'
                    : 'Start Game'}
                </button>
              )}

              <button
                onClick={handleLeave}
                className="px-6 py-3 bg-red-500 bg-opacity-20 border-2 border-red-500 text-red-400 rounded-lg font-semibold hover:bg-opacity-30 transition"
                style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
