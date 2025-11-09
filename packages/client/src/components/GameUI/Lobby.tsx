import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socket';
import { setGameId as saveGameIdToSession, setPlayerName as savePlayerNameToSession, getSession, hasActiveSessionForGame, clearSession } from '../../services/session';
import type { LobbyState } from '@shared';
import { Button, Card, Input, Badge, Spinner, Avatar, Icons } from '../../design-system';

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
            <h1 className="text-5xl font-bold mb-2 text-shadow-glow-cyan">
              Scotland Yard
            </h1>
            <p className="text-gray-400">A game of cat and mouse through London</p>
          </div>

          <Card padding="lg" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Play Online</h2>

            <Input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              size="lg"
            />

            {error && (
              <Card variant="danger" padding="sm">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            <Button
              onClick={() => setMode('create')}
              disabled={!playerName.trim()}
              variant="primary"
              size="lg"
              fullWidth
              glow={!!playerName.trim()}
            >
              Create Game
            </Button>

            <Button
              onClick={() => setMode('join')}
              disabled={!playerName.trim()}
              variant="secondary"
              size="lg"
              fullWidth
              glow={!!playerName.trim()}
            >
              Join Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Create game confirmation
  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card padding="lg" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Create Game</h2>

            <p className="text-gray-400">
              You will be the host and can start the game once all players are ready.
            </p>

            {error && (
              <Card variant="danger" padding="sm">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleCreateGame}
                disabled={isConnecting}
                variant="primary"
                size="lg"
                glow={!isConnecting}
                className="flex-1"
                loading={isConnecting}
              >
                {isConnecting ? 'Creating...' : 'Create'}
              </Button>
              <Button
                onClick={() => setMode('menu')}
                disabled={isConnecting}
                variant="neutral"
                size="lg"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Join game form
  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card padding="lg" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Join Game</h2>

            <Input
              type="text"
              placeholder="Enter Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="uppercase font-mono text-center text-xl"
              maxLength={6}
              size="lg"
              variant="primary"
            />

            {error && (
              <Card variant="danger" padding="sm">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleJoinGame}
                disabled={isConnecting || !gameId.trim()}
                variant="secondary"
                size="lg"
                glow={!isConnecting && !!gameId.trim()}
                className="flex-1"
                loading={isConnecting}
              >
                {isConnecting ? 'Joining...' : 'Join'}
              </Button>
              <Button
                onClick={() => {
                  setMode('menu');
                  setGameId('');
                  setError('');
                }}
                disabled={isConnecting}
                variant="neutral"
                size="lg"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Loading screen while reconnecting
  if (mode === 'waiting' && !lobby) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card padding="lg">
            <div className="text-center space-y-4">
              <Spinner size="xl" variant="primary" className="mx-auto" />
              <h2 className="text-2xl font-semibold">Reconnecting...</h2>
              <p className="text-gray-400">Joining game {gameId}</p>
              {playerName && <p className="text-gray-400">as {playerName}</p>}
            </div>
          </Card>
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
          <Card padding="lg" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Game Lobby</h2>
              <div className="text-center">
                <p className="text-sm text-gray-400">Game ID</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">{lobby.gameId}</p>
              </div>
            </div>

            {/* Copy Invite Button */}
            <Button
              onClick={handleCopyInvite}
              variant="secondary"
              size="md"
              fullWidth
              className="shadow-glow-pink"
            >
              <Icons.copy size={20} />
              Copy Invite Link
            </Button>

            <div className="space-y-2">
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                Players ({lobby.players.length}/{lobby.maxPlayers})
              </p>
              <div className="space-y-2">
                {lobby.players.map((player) => (
                  <Card
                    key={player.id}
                    variant="default"
                    padding="sm"
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar variant="detective" size="md">
                        <Icons.search size={16} />
                      </Avatar>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isHost && (
                        <Badge variant="gold" size="sm">
                          <Icons.crown size={12} />
                          Host
                        </Badge>
                      )}
                      {player.isReady && (
                        <Badge variant="success" size="sm">
                          <Icons.check size={12} />
                          Ready
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {error && (
              <Card variant="danger" padding="sm">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            <div className="flex gap-3">
              {!isHost && (
                <Button
                  onClick={handleReady}
                  variant={me?.isReady ? 'success' : 'neutral'}
                  size="lg"
                  glow={!!me?.isReady}
                  className="flex-1"
                >
                  {me?.isReady ? (
                    <>
                      <Icons.check size={20} />
                      Ready
                    </>
                  ) : (
                    'Ready Up'
                  )}
                </Button>
              )}

              {isHost && (
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  variant="primary"
                  size="lg"
                  glow={canStart}
                  className="flex-1"
                >
                  {lobby.players.length < 2
                    ? 'Waiting for players...'
                    : !allReady
                    ? 'Waiting for ready...'
                    : (
                      <>
                        <Icons.play size={20} />
                        Start Game
                      </>
                    )}
                </Button>
              )}

              <Button
                onClick={handleLeave}
                variant="danger"
                size="lg"
                className="shadow-glow-red"
              >
                Leave
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
