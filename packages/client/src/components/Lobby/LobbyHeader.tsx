import { Button } from '../ui';

interface LobbyHeaderProps {
  gameId: string;
}

/**
 * Lobby header showing game ID and copy invite button
 */
export function LobbyHeader({ gameId }: LobbyHeaderProps) {
  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/${gameId}`;
    navigator.clipboard.writeText(inviteUrl);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Game Lobby</h2>
        <div className="text-center">
          <p className="text-sm text-gray-400">Game ID</p>
          <p className="text-2xl font-mono font-bold text-cyan-400">{gameId}</p>
        </div>
      </div>

      <Button
        onClick={handleCopyInvite}
        variant="secondary"
        size="md"
        fullWidth
        glow
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy Invite Link
      </Button>
    </>
  );
}
