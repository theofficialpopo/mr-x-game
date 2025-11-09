import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socket';
import { setGameId as saveGameIdToSession, setPlayerName as savePlayerNameToSession, getSession, hasActiveSessionForGame, clearSession } from '../../services/session';
import type { LobbyState } from '@shared';
import { LobbyMenu, JoinGameForm, LobbyHeader, PlayerList, LobbyControls } from '../Lobby';
import { logger } from '../../utils/logger';

interface LobbyProps {
  onGameStart: () => void;
  initialGameId?: string;
}

export function Lobby({ onGameStart, initialGameId }: LobbyProps) {
  const navigate = useNavigate();

  // Check if we should auto-reconnect
  const session = getSession();
  const shouldAutoReconnect = !!(initialGameId && hasActiveSessionForGame(initialGameId));

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
        logger.info(`[Reconnect] Found active session for game ${session.gameId}, redirecting...`);
        navigate(`/${session.gameId}`);
        return;
      }

      // If on game URL, check if we have a valid session
      if (initialGameId) {
        const hasSession = session.gameId === initialGameId && session.playerName !== null;

        if (!hasSession) {
          // No session for this game - show join screen with game ID pre-filled
          logger.info(`[Reconnect] No session for game ${initialGameId}, showing join screen`);
          setMode('join');
          setGameId(initialGameId);
          setIsConnecting(false);
          return;
        }

        // Have valid session - try to reconnect
        if (session.playerName) {
          logger.info(`[Reconnect] Attempting to rejoin game ${initialGameId} as ${session.playerName}`);
          setIsConnecting(true);

          // Wait for socket to connect if not connected
          let attempts = 0;
          while (!socketService.isConnected() && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!socketService.isConnected()) {
            logger.info('[Reconnect] Connection timeout - clearing session and redirecting to lobby');
            clearSession();
            navigate('/');
            return;
          }

          // Automatically join the game
          const response = await socketService.joinGame(initialGameId, session.playerName);

          if (!response.success) {
            logger.info('[Reconnect] Failed:', response.error, '- clearing session and redirecting to lobby');
            clearSession();
            navigate('/');
          } else {
            logger.info('[Reconnect] Success!');
          }
        }
      }
    };

    tryReconnect();
  }, [initialGameId, navigate]);

  const handleCreateGameFromMenu = async (name: string) => {
    if (!name) {
      setError('Please enter your name');
      return;
    }

    setPlayerName(name);
    setIsConnecting(true);
    setError('');

    logger.info('[Lobby] Creating game for player:', name);
    const response = await socketService.createGame(name);

    if (response.success && response.gameId) {
      logger.info('[Lobby] Game created:', response.gameId);
      // Save to session for reconnection
      saveGameIdToSession(response.gameId);
      savePlayerNameToSession(name);
      // Also set local state
      setGameId(response.gameId);
      // Navigate to game URL
      navigate(`/${response.gameId}`);
      logger.info('[Lobby] Navigated to game URL');
      // Lobby update will come via socket event
    } else {
      setError(response.error || 'Failed to create game');
      setIsConnecting(false);
    }
  };

  const handleJoinGameFromMenu = (name: string) => {
    if (!name) {
      setError('Please enter your name');
      return;
    }

    setPlayerName(name);
    setMode('join');
  };

  const handleJoinGame = async (enteredGameId: string) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!enteredGameId) {
      setError('Please enter game ID');
      return;
    }

    setIsConnecting(true);
    setError('');

    const normalizedGameId = enteredGameId.toUpperCase();
    logger.info('[Lobby] Joining game:', normalizedGameId, 'as', playerName);
    const response = await socketService.joinGame(normalizedGameId, playerName);

    if (response.success) {
      logger.info('[Lobby] Successfully joined game:', normalizedGameId);
      // Save to session for reconnection
      saveGameIdToSession(normalizedGameId);
      savePlayerNameToSession(playerName);
      // Navigate to game URL
      navigate(`/${normalizedGameId}`);
      logger.info('[Lobby] Navigated to game URL');
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

  const handleBackToMenu = () => {
    setMode('menu');
    setGameId('');
    setError('');
  };

  // Main menu
  if (mode === 'menu') {
    return (
      <LobbyMenu
        onCreateGame={handleCreateGameFromMenu}
        onJoinGame={handleJoinGameFromMenu}
        error={error}
      />
    );
  }

  // Join game form
  if (mode === 'join') {
    return (
      <JoinGameForm
        initialGameId={gameId}
        onJoin={handleJoinGame}
        onBack={handleBackToMenu}
        isConnecting={isConnecting}
        error={error}
      />
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

    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-6 border border-gray-700">
            <LobbyHeader gameId={lobby.gameId} />

            <PlayerList players={lobby.players} maxPlayers={lobby.maxPlayers} />

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <LobbyControls
              isHost={isHost}
              isPlayerReady={me?.isReady ?? false}
              canStart={canStart}
              players={lobby.players}
              allReady={allReady}
              onReady={handleReady}
              onStartGame={handleStartGame}
              onLeave={handleLeave}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
