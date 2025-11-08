/**
 * Player session management with UUID and localStorage persistence
 * Handles reconnection and rejoin logic
 */

export interface PlayerSession {
  playerUUID: string;
  gameId: string | null;
  playerName: string | null;
  timestamp: number;
}

const SESSION_KEY = 'scotland-yard-session';
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a random UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create player session
 */
export function getSession(): PlayerSession {
  try {
    const stored = localStorage.getItem(SESSION_KEY);

    if (stored) {
      const session: PlayerSession = JSON.parse(stored);

      // Check if session has expired
      const now = Date.now();
      const age = now - session.timestamp;

      if (age < SESSION_EXPIRY_MS) {
        return session;
      }

      // Session expired - clear it from localStorage
      console.log('[Session] Session expired (age: ' + Math.round(age / 1000 / 60) + ' minutes), clearing...');
      clearSession();
    }
  } catch (error) {
    console.error('[Session] Failed to load session:', error);
  }

  // Create new session
  return createNewSession();
}

/**
 * Create a new player session
 */
export function createNewSession(): PlayerSession {
  const session: PlayerSession = {
    playerUUID: generateUUID(),
    gameId: null,
    playerName: null,
    timestamp: Date.now(),
  };

  saveSession(session);
  return session;
}

/**
 * Update existing session
 */
export function updateSession(updates: Partial<Omit<PlayerSession, 'playerUUID'>>): PlayerSession {
  const current = getSession();
  const updated: PlayerSession = {
    ...current,
    ...updates,
    timestamp: Date.now(),
  };

  saveSession(updated);
  return updated;
}

/**
 * Save session to localStorage
 */
function saveSession(session: PlayerSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

/**
 * Clear player session (logout/leave game)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

/**
 * Check if player has an active session for a specific game
 */
export function hasActiveSessionForGame(gameId: string): boolean {
  const session = getSession();
  return session.gameId === gameId && session.playerName !== null;
}

/**
 * Get player UUID (creates new session if needed)
 */
export function getPlayerUUID(): string {
  return getSession().playerUUID;
}

/**
 * Update game ID in session
 */
export function setGameId(gameId: string | null): void {
  updateSession({ gameId });
}

/**
 * Update player name in session
 */
export function setPlayerName(name: string | null): void {
  updateSession({ playerName: name });
}

/**
 * Check and cleanup expired session
 * This is called periodically to ensure old sessions are cleaned up
 */
function cleanupExpiredSession(): void {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return;

    const session: PlayerSession = JSON.parse(stored);
    const now = Date.now();
    const age = now - session.timestamp;

    if (age >= SESSION_EXPIRY_MS) {
      console.log('[Session] Auto-cleanup: Removing expired session (age: ' + Math.round(age / 1000 / 60) + ' minutes)');
      clearSession();
    }
  } catch (error) {
    console.error('[Session] Auto-cleanup failed:', error);
  }
}

/**
 * Initialize session cleanup timer
 * Checks every 5 minutes for expired sessions
 */
export function initializeSessionCleanup(): void {
  // Run cleanup immediately on initialization
  cleanupExpiredSession();

  // Then run cleanup every 5 minutes
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  setInterval(cleanupExpiredSession, CLEANUP_INTERVAL_MS);

  console.log('[Session] Auto-cleanup initialized (checks every 5 minutes)');
}
