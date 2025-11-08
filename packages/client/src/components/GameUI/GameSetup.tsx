import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

interface GameSetupProps {
  onGameStart: () => void;
}

export function GameSetup({ onGameStart }: GameSetupProps) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Detective 1', 'Mr. X']);
  const [mrXIndex, setMrXIndex] = useState(1);

  const initializeGame = useGameStore((state) => state.initializeGame);

  // Update player names array when number of players changes
  const handleNumPlayersChange = (num: number) => {
    setNumPlayers(num);
    const newNames = Array.from({ length: num }, (_, i) => {
      if (i < playerNames.length) {
        return playerNames[i];
      }
      return i === 1 ? 'Mr. X' : `Detective ${i}`;
    });
    setPlayerNames(newNames);

    // Ensure mrXIndex is valid
    if (mrXIndex >= num) {
      setMrXIndex(num - 1);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    // Validate all names are filled
    if (playerNames.some((name) => !name.trim())) {
      alert('Please fill in all player names');
      return;
    }

    try {
      initializeGame(playerNames, mrXIndex);
      onGameStart();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start game');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-black bg-opacity-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-3">
            Scotland Yard
          </h1>
          <p className="text-gray-400 text-lg">The Hunt for Mr. X</p>
        </div>

        {/* Number of Players */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Number of Players (2-6)
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleNumPlayersChange(num)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  numPlayers === num
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Player Names</label>
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold ${
                    index === mrXIndex
                      ? 'bg-pink-500 text-white'
                      : 'bg-cyan-500 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={`Player ${index + 1} name`}
                />
                <div className="w-24 text-sm">
                  {index === mrXIndex ? (
                    <span className="text-pink-400 font-semibold">Mr. X</span>
                  ) : (
                    <span className="text-cyan-400">Detective</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mr. X Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Who will be Mr. X?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {playerNames.map((name, index) => (
              <button
                key={index}
                onClick={() => setMrXIndex(index)}
                className={`py-3 px-4 rounded-lg font-semibold transition truncate ${
                  mrXIndex === index
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {name || `Player ${index + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Game Rules Summary */}
        <div className="mb-8 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
          <h3 className="font-bold text-cyan-400 mb-2">Game Rules</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <span className="text-pink-400">Mr. X</span> moves first and tries to evade capture</li>
            <li>• <span className="text-cyan-400">Detectives</span> work together to catch Mr. X</li>
            <li>• Mr. X reveals position on rounds 3, 8, 13, 18, and 24</li>
            <li>• Detectives have limited tickets (Taxi: 11, Bus: 8, Underground: 4)</li>
            <li>• Mr. X wins if he survives 24 rounds</li>
            <li>• Detectives win if they catch Mr. X or trap him</li>
          </ul>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-bold text-lg hover:opacity-90 transition"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
